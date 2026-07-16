<script setup lang="ts">
// 'Suas posições.' (posicoes-v2 — designs-v2/Redentia Carteira Nu.dc.html):
// sidebar de navegação STICKY à esquerda (um botão por classe: mini dot + nome
// + retorno, barra de participação 6px, '{share} da carteira · {count}') +
// coluna direita com UM card branco por classe (header com dot/nome/count,
// total/share, pill de retorno; descrição editorial; CTA azul com chevron cujo
// gap cresce 7→11px no hover; painel interno creme com as linhas de ativo —
// logo REAL via NuAssetLogo, sub 'N cotas · PM R$ X', valor, retorno %).
//
// NAVEGAÇÃO: click no botão → scroll suave até o card (scrollIntoView respeita
// o scroll-margin-top do card = header sticky --nuh-h + 68px, mesmo offset do
// sticky da sidebar); scrollspy rAF-throttled (useNuScrollFrame, padrão do
// NuSectionRail) marca o botão ativo = último card cujo topo passou da linha
// de descanso (+12px de folga, como no rail). Botão ATIVO: bg azul, textos e
// barra brancos.
//
// RESPONSIVO: breakpoint 860px É DO DESIGN (layout desta seção, não o global
// 760) — o wrap vira coluna e a sidebar vira faixa horizontal scrollável
// sticky no topo (botões 220px); o ativo é mantido à vista via scrollLeft.
//
// ESTADOS (diretriz do dono): só classes com dados existem (grupos ausentes
// não renderizam); retorno de linha null → transparente (layout estável, sem
// número inventado); editorial só quando o /portfolio/analysis tem tese
// (fallback: desc some, card segue com CTA). Respeita 'valores ocultos'
// (total/valores → 'R$ ••••', PM mascarado via regex do design).
import type { CarteiraGroupVM } from '~/types/carteira'

const props = defineProps<{ sub: string; groups: CarteiraGroupVM[] }>()
const { hidden } = useHiddenValues()
const NuxtLinkC = resolveComponent('NuxtLink')

// máscara de substring do design: mask = s => s.replace(/PM R$ X/, 'PM R$ ••')
const maskSub = (s: string) => (hidden.value ? s.replace(/PM R\$ [\d.,]+/, 'PM R$ ••') : s)

/* ————— navegação sidebar ⇄ cards (scrollspy + click) ————— */

const active = ref(0)
const sideEl = ref<HTMLElement | null>(null)
const cardEls: (HTMLElement | null)[] = []
const btnEls: (HTMLElement | null)[] = []
const asEl = (el: unknown): HTMLElement | null => (el instanceof HTMLElement ? el : null)
const setCard = (el: unknown, i: number) => { cardEls[i] = asEl(el) }
const setBtn = (el: unknown, i: number) => { btnEls[i] = asEl(el) }

// linha de descanso dos cards: header sticky (--nuh-h no <html>) + 68px do
// scroll-margin-top; +12px de folga pro card recém-rolado já acender (mesma
// constante do NuSectionRail).
function spyLine(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--nuh-h')
  return (Number.parseFloat(raw) || 76) + 68 + 12
}

useNuScrollFrame(() => {
  if (!props.groups.length) return
  const line = spyLine()
  let idx = 0
  props.groups.forEach((_, i) => {
    const el = cardEls[i]
    if (el && el.getBoundingClientRect().top <= line) idx = i
  })
  if (idx !== active.value) active.value = idx
})

function goGroup(i: number) {
  active.value = i
  const el = cardEls[i]
  if (!el) return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

// modo faixa (<860px): mantém o botão ativo à vista na faixa horizontal —
// só quando há overflow-x real, então no desktop (coluna) é no-op.
watch(active, (i) => {
  if (!import.meta.client) return
  const strip = sideEl.value
  const btn = btnEls[i]
  if (!strip || !btn || strip.scrollWidth <= strip.clientWidth + 4) return
  strip.scrollTo({ left: Math.max(0, btn.offsetLeft - 12), behavior: 'smooth' })
})
</script>

<template>
  <section class="cps2">
    <h2 class="cps2__title">Suas posições.</h2>
    <div class="cps2__sub">{{ sub }}</div>

    <!-- Saldo em conta (topo): dinheiro parado por banco, fora dos grupos -->
    <CarteiraSaldoContas />

    <div class="cps2__wrap">
      <!-- sidebar de classes (sticky; <860px vira faixa horizontal) -->
      <div ref="sideEl" class="cps2__side">
        <button
          v-for="(g, i) in groups" :key="g.name" :ref="(el) => setBtn(el, i)"
          type="button" class="cps2__nav" :class="{ 'cps2__nav--active': active === i }"
          :aria-current="active === i ? 'true' : undefined"
          @click="goGroup(i)"
        >
          <span class="cps2__nav-top">
            <span class="cps2__nav-id">
              <span class="cps2__nav-dot" :style="{ background: active === i ? 'var(--nu-white)' : g.color }" />
              <span class="cps2__nav-name">{{ g.name }}</span>
            </span>
            <span v-if="g.ret" class="cps2__nav-ret" :class="`cps2__nav-ret--${g.retKind}`">{{ g.ret }}</span>
          </span>
          <span class="cps2__nav-bar">
            <span
              class="cps2__nav-fill"
              :style="{ width: `${Math.min(g.shareNum, 100)}%`, background: active === i ? 'var(--nu-white)' : g.color }"
            />
          </span>
          <span class="cps2__nav-share">{{ g.share }} da carteira · {{ g.count }}</span>
        </button>
      </div>

      <!-- um card branco por classe -->
      <div class="cps2__col">
        <article
          v-for="(g, i) in groups" :key="g.name" :ref="(el) => setCard(el, i)"
          class="cps2__card"
        >
          <header class="cps2__head">
            <span class="cps2__dot" :style="{ background: g.color }" />
            <span class="cps2__head-main">
              <span class="cps2__name">{{ g.name }}</span>
              <span class="cps2__count">{{ g.count }}</span>
            </span>
            <span class="cps2__spacer" />
            <span class="cps2__totals">
              <span class="cps2__total">{{ hidden ? 'R$ ••••' : g.total }}</span>
              <span class="cps2__share">{{ g.share }} da carteira</span>
            </span>
            <span v-if="g.ret" class="cps2__ret" :class="`cps2__ret--${g.retKind}`">{{ g.ret }}</span>
          </header>

          <p v-if="g.desc" class="cps2__desc">{{ g.desc }}</p>

          <NuxtLink :to="g.ctaHref" class="cps2__cta">
            {{ g.cta }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </NuxtLink>

          <div class="cps2__panel">
            <component
              :is="r.href ? NuxtLinkC : 'span'"
              v-for="(r, j) in g.rows" :key="r.ticker + j"
              :to="r.href ?? undefined"
              class="cps2__row" :class="{ 'cps2__row--first': j === 0 }"
            >
              <NuAssetLogo :ticker="r.ticker" :letter="r.letter" :tile-bg="r.tileBg" :tile-fg="r.tileFg" :size="40" :radius="12" />
              <span class="cps2__row-main">
                <span class="cps2__row-ticker">{{ r.label }}</span>
                <span class="cps2__row-sub">{{ maskSub(r.sub) }}</span>
              </span>
              <span class="cps2__row-nums">
                <span class="cps2__row-val">{{ hidden ? 'R$ ••••' : r.val }}</span>
                <span class="cps2__row-ret" :class="r.ret ? `cps2__row-ret--${r.retDir}` : 'cps2__row-ret--none'">{{ r.ret ?? '' }}</span>
              </span>
            </component>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cps2 {
  background: var(--nu-cream);
  padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.cps2__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.cps2__sub { color: var(--nu-gray); font-size: 17px; font-weight: 600; margin-top: 14px; }
.cps2__wrap { margin-top: 40px; display: flex; gap: clamp(28px, 4vw, 56px); align-items: flex-start; }

/* ——— sidebar de classes ——— */
.cps2__side {
  width: min(300px, 34%); flex: 0 0 auto;
  /* o design usa 124px fixo; aqui compensa o header sticky (--nuh-h) + a
     faixa do NuSectionRail (~51px) + folga = +68px */
  position: sticky; top: calc(var(--nuh-h, 76px) + 68px);
  display: flex; flex-direction: column; gap: 10px;
}
.cps2__nav {
  display: flex; flex-direction: column; gap: 10px; width: 100%;
  padding: 15px 16px; border: none; border-radius: 16px; cursor: pointer;
  font-family: inherit; text-align: left;
  background: var(--nu-white); color: var(--nu-ink);
  box-shadow: var(--nu-shadow-pos-nav);
  transition: background .18s, color .18s, box-shadow .18s;
}
.cps2__nav--active { background: var(--nu-blue); color: var(--nu-white); box-shadow: none; }
.cps2__nav-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; }
.cps2__nav-id { display: inline-flex; align-items: center; gap: 10px; min-width: 0; }
.cps2__nav-dot { width: 11px; height: 11px; border-radius: 4px; flex-shrink: 0; }
.cps2__nav-name { font-size: 16px; font-weight: 800; letter-spacing: -.2px; white-space: nowrap; }
.cps2__nav-ret { font-size: 13.5px; font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums; }
.cps2__nav-ret--up { color: var(--nu-green-2); }
.cps2__nav-ret--down { color: var(--nu-red-2); }
.cps2__nav-ret--flat { color: var(--nu-gray-tag); }
.cps2__nav--active .cps2__nav-ret { color: var(--nu-white); }
.cps2__nav-bar {
  display: block; width: 100%; height: 6px; border-radius: var(--nu-r-pill);
  overflow: hidden; background: var(--nu-cream-line-2);
}
.cps2__nav--active .cps2__nav-bar { background: var(--nu-white-28); }
.cps2__nav-fill { display: block; height: 100%; border-radius: var(--nu-r-pill); }
.cps2__nav-share {
  color: var(--nu-gray); font-size: 12.5px; font-weight: 700;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cps2__nav--active .cps2__nav-share { color: var(--nu-white-82); }

/* ——— cards por classe ——— */
.cps2__col { flex: 1; min-width: 0; }
.cps2__card {
  /* mesmo offset do sticky da sidebar — o card rolado para em linha com ela */
  scroll-margin-top: calc(var(--nuh-h, 76px) + 68px);
  background: var(--nu-white); border-radius: var(--nu-r-pos-card);
  padding: clamp(26px, 3vw, 40px); margin-bottom: 22px;
  box-shadow: var(--nu-shadow-pos-card);
}
.cps2__head { display: flex; align-items: flex-start; gap: 14px; flex-wrap: wrap; }
.cps2__dot { width: 14px; height: 14px; border-radius: 5px; flex-shrink: 0; margin-top: 6px; }
.cps2__head-main { min-width: 0; }
.cps2__name {
  display: block; color: var(--nu-ink); font-size: clamp(22px, 2vw, 28px);
  font-weight: 800; letter-spacing: -.3px; line-height: 1.1;
}
.cps2__count { display: block; color: var(--nu-gray); font-size: 14px; font-weight: 600; margin-top: 3px; }
.cps2__spacer { flex: 1; }
.cps2__totals { text-align: right; }
.cps2__total { display: block; color: var(--nu-ink); font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cps2__share { display: block; color: var(--nu-gray); font-size: 12.5px; font-weight: 700; margin-top: 2px; }
.cps2__ret {
  display: inline-flex; align-items: center; font-size: 13px; font-weight: 800;
  padding: 5px 13px; border-radius: var(--nu-r-pill); white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.cps2__ret--up { background: var(--nu-green-bg); color: var(--nu-green-2); }
.cps2__ret--down { background: var(--nu-red-pill-bg); color: var(--nu-red-2); }
.cps2__ret--flat { background: var(--nu-sand-2); color: var(--nu-gray-tag); }
.cps2__desc {
  margin: 18px 0 0; color: var(--nu-gray-2); font-size: 15.5px; font-weight: 500;
  line-height: 1.65; max-width: 560px;
}
.cps2__cta {
  display: inline-flex; align-items: center; gap: 7px; color: var(--nu-blue);
  font-size: 15px; font-weight: 800; margin-top: 14px; transition: gap .2s;
}
.cps2__cta:hover { gap: 11px; color: var(--nu-blue); }
.cps2__panel {
  margin-top: 20px; background: var(--nu-cream);
  border-radius: var(--nu-r-pos-panel); padding: 6px 22px;
}
.cps2__row { display: flex; align-items: center; gap: 14px; padding: 13px 0; border-top: 1.5px solid var(--nu-cream-line-2); }
.cps2__row--first { border-top: none; }
.cps2__row-main { flex: 1; min-width: 0; overflow: hidden; }
.cps2__row-ticker {
  display: block; color: var(--nu-ink); font-size: 16px; font-weight: 800;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cps2__row-sub {
  display: block; color: var(--nu-gray); font-size: 12.5px; font-weight: 600; margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cps2__row-nums { text-align: right; flex-shrink: 0; }
.cps2__row-val { display: block; color: var(--nu-ink); font-size: 15.5px; font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cps2__row-ret { display: block; font-size: 12.5px; font-weight: 800; margin-top: 2px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.cps2__row-ret--up { color: var(--nu-green-2); }
.cps2__row-ret--down { color: var(--nu-red-2); }
.cps2__row-ret--none { color: transparent; }

/* ——— responsivo: breakpoint 860px DO DESIGN (layout desta seção; o global do
   app é 760) — wrap vira coluna e a sidebar vira faixa horizontal sticky ——— */
/* Mobile (direção do dono 2026-07-13): a navegação vira PÍLULAS compactas
   (só dot + nome + retorno; a barra de share e a linha de detalhe somem) e a
   faixa NÃO é sticky — rola junto com a página. */
@media (max-width: 860px) {
  .cps2__wrap { flex-direction: column; gap: 18px; }
  .cps2__side {
    width: 100%; position: static;
    flex-direction: row; flex-wrap: wrap; overflow-x: visible;
    gap: 8px; padding: 0;
  }
  .cps2__nav {
    flex: 0 0 auto; width: auto;
    padding: 9px 14px; border-radius: var(--nu-r-pill); gap: 0;
  }
  .cps2__nav-top { width: auto; gap: 8px; }
  .cps2__nav-bar, .cps2__nav-share { display: none; }
}
</style>

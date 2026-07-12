<script setup lang="ts">
// 'Suas posições.' (design Carteira Nu): cards sticky empilhados por classe —
// top progressivo (26 + i*82 no design, aqui compensando o header sticky +
// faixa 'Mercado agora' do layout via --nuh-h), card branco radius 24 com
// borda 5px da cor do fundo (efeito stack), minHeight 420px. Cabeçalho com
// dot da classe, contagem, total, share e pill de retorno; corpo 2 colunas
// (painel creme com linhas de ativo — logo REAL via NuAssetLogo, sub
// 'N cotas · PM R$ X', valor, retorno % — + coluna editorial com CTA-seta
// cujo gap cresce 7→11px no hover).
// ESTADOS: retorno % só onde há custo (coluna honesta); editorial só quando o
// /portfolio/analysis tem tese aplicável; grupos ausentes simplesmente não
// existem. Respeita o modo 'valores ocultos' (inclusive PM via regex do design).
import type { CarteiraGroupVM } from '~/types/carteira'

defineProps<{ sub: string; groups: CarteiraGroupVM[] }>()
const { hidden } = useHiddenValues()
const NuxtLinkC = resolveComponent('NuxtLink')

// máscara de substring do design: mask = s => s.replace(/PM R$ X/, 'PM R$ ••')
const maskSub = (s: string) => (hidden.value ? s.replace(/PM R\$ [\d.,]+/, 'PM R$ ••') : s)

// offset sticky: 26px do design + o chrome sticky do layout (header --nuh-h +
// faixa 'Mercado agora' ~48px). Progressão i*82 idêntica ao design.
const stickyTop = (i: number) => `calc(var(--nuh-h, 76px) + ${48 + 26 + i * 82}px)`
</script>

<template>
  <section class="cps">
    <h2 class="cps__title">Suas posições.</h2>
    <div class="cps__sub">{{ sub }}</div>
    <div class="cps__stack">
      <div v-for="(g, i) in groups" :key="g.name" class="cps__card" :style="{ top: stickyTop(i) }">
        <span class="cps__head">
          <span class="cps__dot" :style="{ background: g.color }" />
          <span class="cps__head-main">
            <span class="cps__name">{{ g.name }}</span>
            <span class="cps__count">{{ g.count }}</span>
          </span>
          <span class="cps__spacer" />
          <span class="cps__totals">
            <span class="cps__total">{{ hidden ? 'R$ ••••' : g.total }}</span>
            <span class="cps__share">{{ g.share }} da carteira</span>
          </span>
          <span v-if="g.ret" class="cps__ret" :class="`cps__ret--${g.retKind}`">{{ g.ret }}</span>
        </span>

        <span class="cps__body">
          <span class="cps__panel">
            <component
              :is="r.href ? NuxtLinkC : 'span'"
              v-for="(r, j) in g.rows" :key="r.ticker + j"
              :to="r.href ?? undefined"
              class="cps__row" :class="{ 'cps__row--first': j === 0 }"
            >
              <NuAssetLogo :ticker="r.ticker" :letter="r.letter" :tile-bg="r.tileBg" :tile-fg="r.tileFg" :size="40" :radius="12" />
              <span class="cps__row-main">
                <span class="cps__row-ticker">{{ r.label }}</span>
                <span class="cps__row-sub">{{ maskSub(r.sub) }}</span>
              </span>
              <span class="cps__row-nums">
                <span class="cps__row-val">{{ hidden ? 'R$ ••••' : r.val }}</span>
                <span v-if="r.ret" class="cps__row-ret" :class="`cps__row-ret--${r.retDir}`">{{ r.ret }}</span>
              </span>
            </component>
          </span>
          <span class="cps__editorial">
            <span v-if="g.desc" class="cps__desc">{{ g.desc }}</span>
            <NuxtLink :to="g.ctaHref" class="cps__cta">
              {{ g.cta }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </NuxtLink>
          </span>
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cps {
  background: var(--nu-cream);
  padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.cps__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.cps__sub { color: var(--nu-gray); font-size: 17px; font-weight: 600; margin-top: 14px; }
.cps__stack { margin-top: 36px; }
.cps__card {
  position: sticky; display: block; background: var(--nu-white);
  border: 5px solid var(--nu-cream); border-radius: var(--nu-r-card);
  padding: 24px 30px 26px; margin-bottom: 14px; min-height: 420px;
}
.cps__head { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.cps__dot { width: 14px; height: 14px; border-radius: 5px; flex-shrink: 0; }
.cps__head-main { min-width: 0; }
.cps__name {
  display: block; color: var(--nu-ink); font-size: clamp(21px, 2vw, 26px);
  font-weight: 800; letter-spacing: -.3px; line-height: 1.1; white-space: nowrap;
}
.cps__count { display: block; color: var(--nu-gray); font-size: 14px; font-weight: 600; margin-top: 3px; white-space: nowrap; }
.cps__spacer { flex: 1; }
.cps__totals { text-align: right; }
.cps__total { display: block; color: var(--nu-ink); font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cps__share { display: block; color: var(--nu-gray); font-size: 12.5px; font-weight: 700; margin-top: 2px; }
.cps__ret {
  display: inline-flex; align-items: center; font-size: 13px; font-weight: 800;
  padding: 5px 13px; border-radius: var(--nu-r-pill); white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.cps__ret--up { background: var(--nu-green-bg); color: var(--nu-green-2); }
.cps__ret--down { background: var(--nu-red-pill-bg); color: var(--nu-red-2); }
.cps__ret--flat { background: var(--nu-sand-2); color: var(--nu-gray-tag); }
.cps__body { display: flex; gap: clamp(24px, 4vw, 60px); align-items: flex-start; flex-wrap: wrap; margin-top: 24px; }
.cps__panel {
  flex: 1.25 1 340px; min-width: min(300px, 100%); display: block;
  background: var(--nu-cream); border-radius: var(--nu-r-tile); padding: 8px 22px;
}
.cps__row { display: flex; align-items: center; gap: 14px; padding: 13px 0; border-top: 1.5px solid var(--nu-cream-line-2); }
.cps__row--first { border-top: none; }
.cps__row-main { flex: 1; min-width: 0; overflow: hidden; }
.cps__row-ticker {
  display: block; color: var(--nu-ink); font-size: 16px; font-weight: 800;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cps__row-sub {
  display: block; color: var(--nu-gray); font-size: 12.5px; font-weight: 600; margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cps__row-nums { text-align: right; flex-shrink: 0; }
.cps__row-val { display: block; color: var(--nu-ink); font-size: 15.5px; font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cps__row-ret { display: block; font-size: 12.5px; font-weight: 800; margin-top: 2px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.cps__row-ret--up { color: var(--nu-green-2); }
.cps__row-ret--down { color: var(--nu-red-2); }
.cps__editorial { flex: 1 1 260px; min-width: min(260px, 100%); display: block; padding-top: 6px; }
.cps__desc { display: block; color: var(--nu-gray-2); font-size: 15.5px; font-weight: 500; line-height: 1.65; max-width: 420px; }
.cps__cta {
  display: inline-flex; align-items: center; gap: 7px; color: var(--nu-blue);
  font-size: 15px; font-weight: 800; margin-top: 16px; transition: gap .2s;
}
.cps__cta:hover { gap: 11px; color: var(--nu-blue); }
</style>

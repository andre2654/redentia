<script setup lang="ts">
// "Suas teses." (design Home Nu v2): scroll horizontal (scroll-snap) de cards
// navy em gradiente. Cada card: categoria + pill "Seguindo" (se seguida) +
// convicção, título grande, "Ativos da tese" + chips de ticker, e rodapé com
// retorno verde + label + "Ver tese". Esquerda da seção: título + sub + CTA
// "Explorar teses" → /mercado#teses. Setas prev/next rolam a faixa ±356px.
//
// Substitui a lista vertical de cards-imagem do HomeTheses antigo. MANTÉM os
// dois ESTADOS (favorites reais vs discover) e a dinâmica por card do PR7 — o
// delta de convicção do dia flui pra pill `badge`, o estado de favorito pra
// pill "Seguindo". Dados: buildTheses (useHome) — só muda a apresentação.
import type { HomeThesesVM } from '~/types/home'

defineProps<{ theses: HomeThesesVM }>()

const carRef = ref<HTMLElement | null>(null)
function scroll(d: number) {
  carRef.value?.scrollBy({ left: d * 356, behavior: 'smooth' })
}
// 3 gradientes navy ciclados por posição (valores exatos do design v2).
function gradFor(i: number) {
  return `var(--nu-tese-grad-${(i % 3) + 1})`
}
</script>

<template>
  <section class="hts">
    <div class="hts__cols">
      <div class="hts__head">
        <h2 class="hts__title">Suas teses.</h2>
        <div class="hts__sub">{{ theses.sub }}</div>
        <NuxtLink to="/mercado#teses" class="hts__explore">
          Explorar teses<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9" /></svg>
        </NuxtLink>
      </div>

      <div class="hts__right">
        <div ref="carRef" class="hts__car">
          <NuxtLink
            v-for="(c, i) in theses.cards" :key="c.slug"
            :to="`/tese/${c.slug}`" class="hts__card" :style="{ background: gradFor(i) }"
          >
            <span class="hts__inner">
              <span class="hts__top">
                <span class="hts__top-l">
                  <span class="hts__cat">{{ c.cat }}</span>
                  <span v-if="c.following" class="hts__follow">Seguindo</span>
                </span>
                <span class="hts__conv">{{ c.badge }}</span>
              </span>
              <span class="hts__name">{{ c.title }}</span>
              <span v-if="c.tickers.length" class="hts__ativos-label">Ativos da tese</span>
              <span v-if="c.tickers.length" class="hts__chips">
                <span v-for="tk in c.tickers" :key="tk" class="hts__chip">{{ tk }}</span>
              </span>
              <span class="hts__bottom">
                <span class="hts__ret-wrap">
                  <span v-if="c.perf" class="hts__ret">{{ c.perf }}</span>
                  <span class="hts__since">{{ c.perfLabel }}</span>
                </span>
                <span class="hts__ver">
                  Ver tese<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9" /></svg>
                </span>
              </span>
            </span>
          </NuxtLink>
        </div>
        <div class="hts__nav">
          <button type="button" class="hts__nav-btn" aria-label="Teses anteriores" @click="scroll(-1)">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button type="button" class="hts__nav-btn" aria-label="Próximas teses" @click="scroll(1)">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* padding-right = 0 (a faixa sangra à direita); nav respeita o gutter */
.hts {
  background: var(--nu-cream);
  padding: clamp(60px, 8vw, 104px) 0 clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  overflow: hidden; animation: nu-fade .5s ease both;
}
.hts__cols { display: flex; gap: clamp(28px, 4vw, 60px); align-items: center; flex-wrap: wrap; }
.hts__head { flex: 0 1 380px; min-width: min(300px, 100%); padding-right: 22px; }
.hts__title { margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.6vw, 60px); font-weight: 800; letter-spacing: -0.04em; line-height: 1.04; }
.hts__sub { color: var(--nu-gray); font-size: 16px; font-weight: 600; margin-top: 16px; line-height: 1.5; max-width: 340px; }
.hts__explore {
  display: inline-flex; align-items: center; gap: 9px; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.hts__explore:hover { background: var(--nu-blue-hover); color: var(--nu-white); }

.hts__right { flex: 1 1 480px; min-width: min(320px, 100%); }
.hts__car { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 6px 22px 10px 2px; }

.hts__card {
  position: relative; display: flex; flex-direction: column; flex: 0 0 auto;
  width: min(340px, 80vw); min-height: 452px; border-radius: var(--nu-r-card);
  padding: 28px; scroll-snap-align: start; overflow: hidden;
  transition: transform .15s;
}
.hts__card:hover { transform: translateY(-3px); }
.hts__inner { position: relative; z-index: 1; display: flex; flex-direction: column; flex: 1; min-height: 0; }

.hts__top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.hts__top-l { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.hts__cat { color: var(--nu-white-92); font-size: 14.5px; font-weight: 800; }
.hts__follow {
  display: inline-flex; align-items: center; background: var(--nu-green-soft-22); color: var(--nu-green-soft);
  font-size: 11px; font-weight: 800; padding: 4px 9px; border-radius: var(--nu-r-pill); white-space: nowrap;
}
.hts__conv {
  display: inline-flex; align-items: center; background: var(--nu-white-16); color: var(--nu-white);
  font-size: 11px; font-weight: 800; padding: 5px 10px; border-radius: var(--nu-r-pill);
  white-space: nowrap; font-variant-numeric: tabular-nums;
}
.hts__name { display: block; color: var(--nu-white); font-size: clamp(23px, 2vw, 27px); font-weight: 800; letter-spacing: -.4px; line-height: 1.16; margin-top: auto; }
.hts__ativos-label { display: block; color: var(--nu-white-60); font-size: 11px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; margin-top: 20px; }
.hts__chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 11px; }
.hts__chip {
  display: inline-flex; align-items: center; padding: 6px 11px; border-radius: 9px;
  font-size: 12.5px; font-weight: 800; letter-spacing: .3px; background: var(--nu-white-16);
  color: var(--nu-white); font-variant-numeric: tabular-nums;
}
.hts__bottom { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-top: 22px; padding-top: 20px; border-top: 1px solid var(--nu-white-18); }
.hts__ret { display: block; color: var(--nu-green-soft); font-size: 27px; font-weight: 800; letter-spacing: -.5px; line-height: 1; font-variant-numeric: tabular-nums; }
.hts__since { display: block; color: var(--nu-white-62); font-size: 12px; font-weight: 600; margin-top: 5px; }
.hts__ver {
  display: inline-flex; align-items: center; gap: 7px; border: 1.5px solid var(--nu-white-85); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 10px 17px; font-size: 13.5px; font-weight: 800; white-space: nowrap; flex-shrink: 0;
}

.hts__nav { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; padding-right: clamp(22px, 5.5vw, 80px); }
.hts__nav-btn {
  width: 46px; height: 46px; border-radius: 50%; background: var(--nu-blue); border: none;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s;
}
.hts__nav-btn:hover { background: var(--nu-blue-hover); }

/* Mobile (padrão app 760): a seção empilha — header em cima, faixa embaixo. As
   setas continuam (o scroll-snap também responde a toque/trackpad). */
@media (max-width: 760px) {
  .hts__head { padding-right: 22px; }
}
</style>

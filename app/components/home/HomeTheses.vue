<script setup lang="ts">
// "Suas teses." (design Home Nu): cards horizontais brancos com imagem 240px
// sobre navy, título + badge de convicção, retorno + nº de ativos e box
// "Hoje:" com o update da revalidação diária (dot azul = mudança, bege =
// estável). MODOS: 'favorites' (thesis_favorites reais) | 'discover' (sem
// favorito → 2 teses reais marcadas 'Explorar' — nunca vazio morto).
// HONESTIDADE: o retorno é o do backtest ('desde o lançamento') — a API de
// favoritos não expõe a data do favorito.
import type { HomeThesesVM } from '~/types/home'

defineProps<{ theses: HomeThesesVM }>()

// Capa quebrada não pode vazar ícone de imagem partida — degrada pro navy.
const failed = ref<Record<string, boolean>>({})
</script>

<template>
  <section class="hts">
    <div class="hts__head">
      <div>
        <h2 class="hts__title">Suas teses.</h2>
        <div class="hts__sub">{{ theses.sub }}</div>
      </div>
      <NuxtLink to="/mercado#teses" class="hts__explore">
        <span class="hts__explore-label">Explorar teses</span>
        <span class="hts__explore-circle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </span>
      </NuxtLink>
    </div>

    <div class="hts__list">
      <NuxtLink v-for="c in theses.cards" :key="c.slug" :to="`/tese/${c.slug}`" class="hts__card">
        <span class="hts__media">
          <img
            v-if="c.image && !failed[c.slug]" :src="c.image" :alt="c.title"
            class="hts__img" loading="lazy" @error="failed[c.slug] = true"
          >
        </span>
        <span class="hts__body">
          <span class="hts__top">
            <span class="hts__name">{{ c.title }}</span>
            <span class="hts__badge" :class="`hts__badge--${c.badgeTone}`">{{ c.badge }}</span>
          </span>
          <span class="hts__stats">
            <span v-if="c.perf"><span class="hts__perf">{{ c.perf }}</span><span class="hts__perf-label"> {{ c.perfLabel }}</span></span>
            <span class="hts__ativos">{{ c.ativos }}</span>
          </span>
          <span class="hts__box">
            <span class="hts__dot" :class="`hts__dot--${c.boxDot}`" />
            <span class="hts__box-text"><strong class="hts__box-strong">{{ c.boxStrong }}</strong> {{ c.boxText }}</span>
          </span>
        </span>
        <span class="hts__arrow-col">
          <span class="hts__arrow">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </span>
        </span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.hts { background: var(--nu-cream); padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.hts__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.hts__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.hts__sub { color: var(--nu-gray); font-size: 16px; font-weight: 600; margin-top: 14px; }
.hts__explore { display: inline-flex; align-items: center; gap: 12px; flex-shrink: 0; transition: gap .2s; }
.hts__explore:hover { gap: 16px; }
.hts__explore-label { color: var(--nu-ink); font-size: 16px; font-weight: 800; }
.hts__explore-circle {
  width: 44px; height: 44px; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
}
.hts__list { display: flex; flex-direction: column; gap: 14px; margin-top: 36px; }
.hts__card {
  display: flex; flex-wrap: wrap; align-items: stretch; background: var(--nu-white);
  border-radius: var(--nu-r-card-lg); overflow: hidden; transition: transform .15s;
}
.hts__card:hover { transform: translateY(-2px); }
.hts__media {
  flex: 0 1 240px; min-width: min(240px, 100%); min-height: 190px;
  position: relative; display: block; background: var(--nu-navy);
}
.hts__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.hts__body {
  flex: 1.6 1 380px; min-width: min(300px, 100%); padding: clamp(22px, 2.5vw, 30px);
  display: flex; flex-direction: column;
}
.hts__top { display: flex; align-items: center; gap: 11px; flex-wrap: wrap; }
.hts__name { color: var(--nu-ink); font-size: clamp(20px, 1.9vw, 24px); font-weight: 800; letter-spacing: -.3px; }
.hts__badge {
  display: inline-flex; align-items: center; font-size: 12px; font-weight: 800;
  padding: 5px 12px; border-radius: var(--nu-r-pill); white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.hts__badge--green { background: var(--nu-green-bg); color: var(--nu-green-2); }
.hts__badge--neutral { background: var(--nu-sand-2); color: var(--nu-gray-2); }
.hts__badge--blue { background: var(--nu-blue-bg); color: var(--nu-blue-deep); }
.hts__stats { display: flex; align-items: baseline; gap: 22px; flex-wrap: wrap; margin-top: 12px; margin-bottom: 18px; }
.hts__perf { color: var(--nu-green-2); font-size: 19px; font-weight: 800; font-variant-numeric: tabular-nums; }
.hts__perf-label { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }
.hts__ativos { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }
.hts__box {
  display: flex; align-items: flex-start; gap: 9px; background: var(--nu-cream);
  border-radius: var(--nu-r-input); padding: 12px 16px; margin-top: auto;
}
.hts__dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
.hts__dot--blue { background: var(--nu-blue); }
.hts__dot--sand { background: var(--nu-sand); }
.hts__box-text { color: var(--nu-gray-3); font-size: 13.5px; font-weight: 600; line-height: 1.5; }
.hts__box-strong { font-weight: 800; }
.hts__arrow-col { display: flex; align-items: center; padding: 0 clamp(18px, 2vw, 28px); }
.hts__arrow {
  width: 46px; height: 46px; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
}

/* Mobile (UX do dono 2026-07-11): o card empilha em coluna — imagem no topo
   ocupando a largura TODA, corpo embaixo; a coluna da seta (que quebrava o
   flex-wrap) some — o card inteiro já é o link. */
@media (max-width: 760px) {
  .hts__card { flex-direction: column; flex-wrap: nowrap; }
  .hts__media { flex: none; width: 100%; min-height: 200px; }
  /* em coluna, o flex-basis 380px do desktop viraria ALTURA (vão gigante) */
  .hts__body { flex: none; min-width: 0; }
  .hts__box { margin-top: 16px; }
  .hts__arrow-col { display: none; }
}
</style>

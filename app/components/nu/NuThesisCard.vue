<script setup lang="ts">
// Card de tese (540px, navy, imagem + scrim de 4 stops) — valores exatos do
// design (Redentia Mercado Nu.dc.html, seção Teses). O bookmark é visual no
// PR1 (o design não liga ação); thesis_favorites entra com o fluxo logado.
import type { NuThesis } from '~/types/market'

defineProps<{ t: NuThesis }>()

// Capa quebrada não pode vazar ícone de imagem partida — degrada pro navy.
const imgFailed = ref(false)
</script>

<template>
  <div class="ntc">
    <div class="ntc__media">
      <img v-if="t.image && !imgFailed" :src="t.image" :alt="t.cat" class="ntc__img" loading="lazy" @error="imgFailed = true">
    </div>
    <div class="ntc__scrim" />
    <div class="ntc__body">
      <div class="ntc__top">
        <span class="ntc__cat">{{ t.cat }}</span>
        <button type="button" class="ntc__bookmark" aria-label="Salvar tese">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-4.5L5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
        </button>
      </div>
      <div class="ntc__bottom">
        <div class="ntc__perf-row">
          <span v-if="t.perf" class="ntc__perf">{{ t.perf }}</span>
          <span class="ntc__perf-label">{{ t.perfLabel }}</span>
        </div>
        <div class="ntc__title">{{ t.titlePre }}<span v-if="t.titleHi" class="ntc__hi">{{ t.titleHi }}</span>{{ t.titlePost }}</div>
        <div class="ntc__desc">{{ t.desc }}</div>
        <div class="ntc__chips">
          <span v-for="k in t.tickers" :key="k.name" class="ntc__chip">
            <span class="ntc__tile" :style="{ background: k.tile }">{{ k.letter }}</span>
            <span class="ntc__chip-name">{{ k.name }}</span>
          </span>
          <span v-if="t.more" class="ntc__more">{{ t.more }}</span>
        </div>
        <div class="ntc__footer">
          <span class="ntc__fontes">{{ t.fontes }}</span>
          <NuxtLink :to="t.href" class="ntc__access">
            Acessar<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ntc { position: relative; height: 540px; border-radius: 28px; overflow: hidden; background: var(--nu-navy); }
.ntc__media { position: absolute; inset: 0; }
.ntc__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ntc__scrim { position: absolute; inset: 0; background: var(--nu-thesis-scrim); pointer-events: none; }
.ntc__body {
  position: absolute; inset: 0; padding: clamp(20px, 2.5vw, 28px);
  display: flex; flex-direction: column; pointer-events: none;
}
.ntc__top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.ntc__cat { color: var(--nu-white-88); font-size: 12.5px; font-weight: 800; letter-spacing: 2.2px; text-transform: uppercase; }
.ntc__bookmark {
  pointer-events: auto; width: 42px; height: 42px; border-radius: 50%;
  background: var(--nu-white-16); backdrop-filter: blur(8px); border: none;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s;
}
.ntc__bookmark:hover { background: var(--nu-white-30); }
.ntc__bottom { margin-top: auto; }
.ntc__perf-row { display: flex; align-items: center; gap: 11px; flex-wrap: wrap; }
.ntc__perf {
  display: inline-flex; align-items: center; background: var(--nu-green-soft); color: var(--nu-navy);
  font-size: 14px; font-weight: 800; padding: 5px 13px; border-radius: var(--nu-r-pill);
  font-variant-numeric: tabular-nums;
}
.ntc__perf-label { color: var(--nu-white-65); font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
.ntc__title {
  color: var(--nu-white); font-size: clamp(24px, 2.3vw, 31px); font-weight: 800;
  line-height: 1.18; letter-spacing: -.5px; margin-top: 12px;
}
.ntc__hi { background: var(--nu-blue); padding: 1px 9px; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.ntc__desc { color: var(--nu-white-78); font-size: 14.5px; font-weight: 500; line-height: 1.55; margin-top: 10px; }
.ntc__chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
.ntc__chip {
  display: inline-flex; align-items: center; gap: 8px; background: var(--nu-white-14);
  backdrop-filter: blur(8px); border-radius: var(--nu-r-pill); padding: 5px 13px 5px 5px;
}
.ntc__tile {
  width: 22px; height: 22px; flex-shrink: 0; border-radius: 7px; color: var(--nu-navy);
  display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800;
}
.ntc__chip-name { color: var(--nu-white); font-size: 12.5px; font-weight: 800; }
.ntc__more {
  display: inline-flex; align-items: center; border: 1.5px solid var(--nu-white-35);
  color: var(--nu-white-85); font-size: 12.5px; font-weight: 800; padding: 6px 12px; border-radius: var(--nu-r-pill);
}
.ntc__footer {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  border-top: 1px solid var(--nu-white-18); margin-top: 18px; padding-top: 15px;
}
.ntc__fontes { color: var(--nu-white-60); font-size: 13px; font-weight: 700; letter-spacing: 1px; }
.ntc__access {
  pointer-events: auto; display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-white); color: var(--nu-ink); border-radius: var(--nu-r-pill);
  padding: 11px 22px; font-size: 14px; font-weight: 800; transition: transform .15s;
}
.ntc__access:hover { transform: translateY(-1px); }
</style>

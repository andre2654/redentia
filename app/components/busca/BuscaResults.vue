<script setup lang="ts">
// Resultados da busca — grupos Ativos/Teses/Guias com divisores, filtrados
// live. Logos reais via <NuAssetLogo> (direção do dono: logos no lugar dos
// tiles de letra do mock; fallback = tile colorido via tileFor).
// Contrato de UX: Redentia Busca Nu.dc.html (linhas 216-275).
import type { BuscaResultsVM } from '~/composables/useBuscaIndex'

const props = defineProps<{ results: BuscaResultsVM }>()

const failedCovers = ref<Set<string>>(new Set())
function coverFailed(slug: string) {
  failedCovers.value = new Set(failedCovers.value).add(slug)
}
</script>

<template>
  <section class="bsr">
    <div class="bsr__label">{{ props.results.label }}</div>

    <template v-if="props.results.assets.length">
      <div class="bsr__group">Ativos</div>
      <div class="bsr__grid">
        <NuxtLink v-for="(a, i) in props.results.assets" :key="a.ticker" :to="a.href" class="bsr__row">
          <NuAssetLogo
            :ticker="a.ticker" :letter="a.ticker.charAt(0)"
            :tile-bg="tileFor(a.ticker, null, i)[0]" :tile-fg="tileFor(a.ticker, null, i)[1]"
            :size="42" :radius="12"
          />
          <span class="bsr__row-main">
            <span class="bsr__ticker">{{ a.ticker }}</span>
            <span class="bsr__name">{{ a.name }}</span>
          </span>
          <span v-if="a.price" class="bsr__quote">
            <span class="bsr__price">{{ a.price }}</span>
            <span v-if="a.pct" class="bsr__pct" :class="a.dir === 'down' ? 'bsr__pct--down' : 'bsr__pct--up'">{{ a.pct }}</span>
          </span>
          <svg class="bsr__chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </NuxtLink>
      </div>
    </template>

    <template v-if="props.results.tesouro.length">
      <div class="bsr__group bsr__group--far">Tesouro Direto</div>
      <div class="bsr__grid">
        <NuxtLink v-for="t in props.results.tesouro" :key="t.slug" :to="t.href" class="bsr__row">
          <span class="bsr__tag">{{ t.indexer }}</span>
          <span class="bsr__row-main">
            <span class="bsr__ticker bsr__ticker--wrap">{{ t.name }}</span>
          </span>
          <span class="bsr__quote">
            <span class="bsr__price">{{ t.rate }}</span>
          </span>
          <svg class="bsr__chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </NuxtLink>
      </div>
    </template>

    <template v-if="props.results.theses.length">
      <div class="bsr__group bsr__group--far">Teses</div>
      <div class="bsr__theses">
        <NuxtLink v-for="t in props.results.theses" :key="t.slug" :to="t.href" class="bsr__thesis">
          <span class="bsr__thumb">
            <img
              v-if="t.image && !failedCovers.has(t.slug)" :src="t.image" :alt="t.title"
              class="bsr__thumb-img" loading="lazy" @error="coverFailed(t.slug)"
            >
          </span>
          <span class="bsr__thesis-main">
            <span class="bsr__thesis-title">{{ t.title }}</span>
            <span class="bsr__thesis-meta">{{ t.meta }}</span>
          </span>
          <svg class="bsr__chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </NuxtLink>
      </div>
    </template>

    <template v-if="props.results.guias.length">
      <div class="bsr__group bsr__group--far">Guias</div>
      <div class="bsr__grid">
        <NuxtLink v-for="g in props.results.guias" :key="g.title" :to="g.href" class="bsr__row">
          <span class="bsr__tag">{{ g.tag }}</span>
          <span class="bsr__guide-title">{{ g.title }}</span>
          <span class="bsr__min">{{ g.minutes }}</span>
          <svg class="bsr__chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </NuxtLink>
      </div>
    </template>
  </section>
</template>

<style scoped>
.bsr {
  background: var(--nu-white);
  padding: clamp(44px, 5.5vw, 72px) clamp(22px, 5.5vw, 80px) clamp(64px, 8vw, 100px);
  animation: nu-fade .5s ease both;
}
.bsr__label { color: var(--nu-gray); font-size: 15px; font-weight: 700; }
.bsr__group {
  color: var(--nu-blue); font-size: 12.5px; font-weight: 800;
  letter-spacing: 1.3px; text-transform: uppercase; margin-top: 28px;
}
.bsr__group--far { margin-top: 36px; }

/* Ativos + Guias: grid de linhas com divisores */
.bsr__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(360px, 100%), 1fr));
  gap: 0 clamp(24px, 3vw, 48px); margin-top: 6px;
}
.bsr__row {
  display: flex; align-items: center; gap: 14px; padding: 15px 0;
  border-bottom: 1.5px solid var(--nu-cream-2);
}
.bsr__row:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.bsr__row-main { flex: 1; min-width: 0; }
.bsr__ticker { display: block; color: var(--nu-ink); font-size: 16px; font-weight: 800; white-space: nowrap; }
.bsr__ticker--wrap { overflow: hidden; text-overflow: ellipsis; font-size: 15px; }
.bsr__name {
  display: block; color: var(--nu-gray); font-size: 13px; font-weight: 600; margin-top: 1px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.bsr__quote { text-align: right; flex-shrink: 0; }
.bsr__price {
  display: block; color: var(--nu-ink); font-size: 15px; font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.bsr__pct { display: block; font-size: 12.5px; font-weight: 800; margin-top: 1px; font-variant-numeric: tabular-nums; }
.bsr__pct--up { color: var(--nu-green-2); }
.bsr__pct--down { color: var(--nu-red-2); }
.bsr__chev { flex-shrink: 0; color: var(--nu-sand); }

/* Teses: cards creme */
.bsr__theses {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr));
  gap: 14px; margin-top: 14px;
}
.bsr__thesis {
  display: flex; align-items: center; gap: 16px;
  background: var(--nu-cream); border-radius: 20px;
  padding: 14px 18px 14px 14px; transition: transform .15s;
}
.bsr__thesis:hover { transform: translateY(-2px); }
.bsr__thesis:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.bsr__thumb {
  width: 86px; height: 64px; flex-shrink: 0; position: relative; display: block;
  border-radius: 12px; overflow: hidden; background: var(--nu-navy);
}
.bsr__thumb-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.bsr__thesis-main { flex: 1; min-width: 0; }
.bsr__thesis-title { display: block; color: var(--nu-ink); font-size: 15.5px; font-weight: 800; line-height: 1.25; }
.bsr__thesis-meta { display: block; color: var(--nu-gray); font-size: 12.5px; font-weight: 700; margin-top: 4px; }

/* Guias */
.bsr__tag {
  display: inline-flex; align-items: center; flex-shrink: 0;
  background: var(--nu-cream); color: var(--nu-gray);
  font-size: 11.5px; font-weight: 800; padding: 5px 11px;
  border-radius: var(--nu-r-pill); white-space: nowrap;
}
.bsr__guide-title { flex: 1; min-width: 0; color: var(--nu-ink); font-size: 15.5px; font-weight: 700; line-height: 1.35; }
.bsr__min { color: var(--nu-gray); font-size: 12.5px; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
</style>

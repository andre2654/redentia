<script setup lang="ts">
// Lista navegável por tipo (pill selecionada, sem query) — adição do dono
// 2026-07-13. Reusa o visual das linhas de ativo do BuscaResults (logo/nome/
// preço/variação + chevron azul). Tesouro tem linha própria (badge do
// indexador + taxa). Degrade honesto: fonte fora → estado vazio honesto.
import type { BuscaBrowseVM } from '~/composables/useBuscaIndex'

const props = defineProps<{ browse: BuscaBrowseVM }>()
const emit = defineEmits<{ (e: 'more'): void }>()
</script>

<template>
  <section class="bbl">
    <div class="bbl__head">
      <div class="bbl__label">{{ props.browse.label }}</div>
      <NuxtLink v-if="props.browse.moreHref" :to="props.browse.moreHref" class="bbl__deep">
        {{ props.browse.moreLabel }}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </NuxtLink>
    </div>

    <!-- carregando (fonte lazy ainda em voo) -->
    <div v-if="props.browse.loading && !props.browse.assets.length && !props.browse.tesouro.length" class="bbl__state">
      Carregando…
    </div>

    <!-- fonte fora do ar -->
    <div v-else-if="props.browse.unavailable" class="bbl__state">
      Não foi possível carregar agora. Tente de novo em instantes.
    </div>

    <!-- vazio legítimo -->
    <div v-else-if="props.browse.empty" class="bbl__state">
      Nada por aqui ainda.
    </div>

    <template v-else>
      <!-- Ações / FIIs / BDRs / Cripto (linha de ativo) -->
      <div v-if="props.browse.assets.length" class="bbl__grid">
        <NuxtLink v-for="(a, i) in props.browse.assets" :key="a.ticker" :to="a.href" class="bbl__row">
          <NuAssetLogo
            :ticker="a.ticker" :letter="a.ticker.charAt(0)"
            :tile-bg="tileFor(a.ticker, null, i)[0]" :tile-fg="tileFor(a.ticker, null, i)[1]"
            :size="42" :radius="12"
          />
          <span class="bbl__row-main">
            <span class="bbl__ticker">{{ a.ticker }}</span>
            <span class="bbl__name">{{ a.name }}</span>
          </span>
          <span v-if="a.price" class="bbl__quote">
            <span class="bbl__price">{{ a.price }}</span>
            <span v-if="a.pct" class="bbl__pct" :class="a.dir === 'down' ? 'bbl__pct--down' : 'bbl__pct--up'">{{ a.pct }}</span>
          </span>
          <svg class="bbl__chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </NuxtLink>
      </div>

      <!-- Tesouro Direto (linha própria: indexador + taxa) -->
      <div v-if="props.browse.tesouro.length" class="bbl__grid">
        <NuxtLink v-for="t in props.browse.tesouro" :key="t.slug" :to="t.href" class="bbl__row">
          <span class="bbl__tag">{{ t.indexer }}</span>
          <span class="bbl__row-main">
            <span class="bbl__ticker bbl__ticker--wrap">{{ t.name }}</span>
          </span>
          <span class="bbl__quote">
            <span class="bbl__price">{{ t.rate }}</span>
          </span>
          <svg class="bbl__chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </NuxtLink>
      </div>

      <button v-if="props.browse.hasMore" type="button" class="bbl__more" @click="emit('more')">
        Ver mais
      </button>
    </template>
  </section>
</template>

<style scoped>
.bbl {
  background: var(--nu-white);
  padding: clamp(24px, 3.5vw, 44px) clamp(22px, 5.5vw, 80px) clamp(64px, 8vw, 100px);
  animation: nu-fade .5s ease both;
}
.bbl__head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.bbl__label { color: var(--nu-ink); font-size: 17px; font-weight: 800; }
.bbl__deep {
  display: inline-flex; align-items: center; gap: 5px;
  color: var(--nu-blue); font-size: 13.5px; font-weight: 800; white-space: nowrap;
}
.bbl__deep:hover { text-decoration: underline; }
.bbl__deep:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.bbl__state { color: var(--nu-gray); font-size: 14.5px; font-weight: 600; margin-top: 20px; }

.bbl__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(360px, 100%), 1fr));
  gap: 0 clamp(24px, 3vw, 48px); margin-top: 10px;
}
.bbl__row {
  display: flex; align-items: center; gap: 14px; padding: 15px 0;
  border-bottom: 1.5px solid var(--nu-cream-2);
}
.bbl__row:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.bbl__row-main { flex: 1; min-width: 0; }
.bbl__ticker { display: block; color: var(--nu-ink); font-size: 16px; font-weight: 800; white-space: nowrap; }
.bbl__ticker--wrap { overflow: hidden; text-overflow: ellipsis; font-size: 15px; }
.bbl__name {
  display: block; color: var(--nu-gray); font-size: 13px; font-weight: 600; margin-top: 1px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.bbl__quote { text-align: right; flex-shrink: 0; }
.bbl__price {
  display: block; color: var(--nu-ink); font-size: 15px; font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.bbl__pct { display: block; font-size: 12.5px; font-weight: 800; margin-top: 1px; font-variant-numeric: tabular-nums; }
.bbl__pct--up { color: var(--nu-green-2); }
.bbl__pct--down { color: var(--nu-red-2); }
.bbl__chev { flex-shrink: 0; color: var(--nu-sand); }
.bbl__tag {
  display: inline-flex; align-items: center; flex-shrink: 0;
  background: var(--nu-cream); color: var(--nu-gray);
  font-size: 11.5px; font-weight: 800; padding: 5px 11px;
  border-radius: var(--nu-r-pill); white-space: nowrap;
}

.bbl__more {
  margin-top: 26px;
  background: var(--nu-white); color: var(--nu-blue);
  border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill);
  padding: 11px 26px; font-size: 14.5px; font-weight: 800; cursor: pointer;
  transition: background .2s;
}
.bbl__more:hover { background: var(--nu-blue-tint-2); }
.bbl__more:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
</style>

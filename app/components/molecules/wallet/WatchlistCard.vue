<!--
  WatchlistCard — tickers que o user esta acompanhando.

  Versao MINIMALISTA: header pequeno + lista enxuta. Cada ticker
  vira 1 linha bem compacta com nome + preco + variacao.
-->
<template>
  <article class="watch-card">
    <header class="watch-card__head">
      <div class="watch-card__title-group">
        <span class="watch-card__eyebrow">Watchlist</span>
        <h3 class="watch-card__title">Ativos que você acompanha</h3>
      </div>
      <NuxtLink to="/help?intent=add-watchlist" class="watch-card__add" aria-label="Adicionar ticker no chat">
        <UIcon name="i-lucide-plus" class="size-3" aria-hidden="true" />
        <span>Nova</span>
      </NuxtLink>
    </header>

    <!-- Empty -->
    <NuxtLink v-if="!items.length" to="/help?intent=add-watchlist" class="watch-card__empty">
      <UIcon name="i-lucide-eye" class="size-4 shrink-0" aria-hidden="true" />
      <span>Adicione tickers pelo chat e a gente acompanha aqui</span>
      <UIcon name="i-lucide-arrow-up-right" class="size-3 shrink-0 ml-auto" aria-hidden="true" />
    </NuxtLink>

    <!-- List -->
    <ul v-else class="watch-card__list">
      <li v-for="w in items" :key="w.ticker" class="watch-card__item">
        <span class="watch-card__ticker">{{ w.ticker }}</span>
        <span class="watch-card__name">{{ w.name || w.note || '—' }}</span>
        <span
          v-if="w.current_price !== undefined && w.current_price !== null"
          class="watch-card__price"
        >{{ formatBRL2(w.current_price) }}</span>
        <span
          v-if="w.change_pct !== undefined && w.change_pct !== null"
          class="watch-card__change"
          :class="w.change_pct >= 0 ? 'watch-card__change--pos' : 'watch-card__change--neg'"
        >{{ formatPct(w.change_pct) }}</span>
      </li>
    </ul>
  </article>
</template>

<script setup lang="ts">
import type { WatchlistItem } from '~/services/walletData'

interface Props {
  items: WatchlistItem[]
}
defineProps<Props>()

function formatBRL2(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}
function formatPct(n: number): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2).replace('.', ',')}%`
}
</script>

<style scoped>
.watch-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background));
  transition: border-color 180ms;
}

.watch-card:hover {
  border-color: color-mix(in srgb, var(--brand-border) 75%, transparent);
}

/* ============ HEAD ============ */
.watch-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.watch-card__title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.watch-card__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

.watch-card__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: var(--text-heading, var(--brand-text));
}

.watch-card__add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 7px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
  text-decoration: none;
  transition: background 150ms;
  flex-shrink: 0;
}

.watch-card__add:hover {
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
}

/* ============ EMPTY ============ */
.watch-card__empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  border: 1px dashed color-mix(in srgb, var(--brand-border) 55%, transparent);
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  text-decoration: none;
  transition: background 150ms, border-color 150ms;
}

.watch-card__empty:hover {
  background: color-mix(in srgb, var(--brand-primary) 5%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  color: var(--brand-primary);
}

/* ============ LIST ============ */
.watch-card__list {
  display: flex;
  flex-direction: column;
  gap: 0;
  list-style: none;
  padding: 0;
  margin: 0;
}

.watch-card__item {
  display: grid;
  grid-template-columns: 56px 1fr auto auto;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
}

.watch-card__item:last-child {
  border-bottom: none;
}

.watch-card__ticker {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.005em;
  color: var(--brand-text);
}

.watch-card__name {
  font-size: 11.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.watch-card__price {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-size: 11.5px;
  color: var(--brand-text);
}

.watch-card__change {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  font-weight: 600;
  min-width: 56px;
  text-align: right;
}

.watch-card__change--pos {
  color: var(--brand-positive, #16a34a);
}

.watch-card__change--neg {
  color: var(--brand-negative, #dc2626);
}
</style>

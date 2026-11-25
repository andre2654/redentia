<script setup lang="ts">
// Lista de um recorte (FIIs ou small caps). Cada linha leva a dividendos,
// quanto rende e o ativo. O número e a data já vêm formatados do recorte.
import type { LinhaPublicada } from '~/utils/rankingsRecorte'

defineProps<{
  itens: LinhaPublicada[]
}>()
</script>

<template>
  <ol v-if="itens.length" class="rcl">
    <li v-for="item in itens" :key="item.ticker" class="rcl__item">
      <div class="rcl__quem">
        <NuxtLink :to="`/asset/${item.ticker}`" class="rcl__nome">
          <NuAssetLogo :ticker="item.ticker" :letter="item.ticker.charAt(0)" tile-bg="var(--nu-cream-2)" tile-fg="var(--nu-ink)" :size="36" :radius="10" />
          <span>
            <span class="rcl__ticker">{{ item.ticker }}</span>
            <span class="rcl__empresa">{{ item.nome }}</span>
          </span>
        </NuxtLink>
      </div>
      <dl class="rcl__nums">
        <div v-for="n in item.numeros" :key="n.rotulo">
          <dt>{{ n.rotulo }}</dt>
          <dd>{{ n.valor }}</dd>
        </div>
      </dl>
      <nav class="rcl__ir" :aria-label="`Páginas de ${item.ticker}`">
        <NuxtLink :to="`/dividendos/${item.ticker}`">Dividendos</NuxtLink>
        <NuxtLink :to="`/quanto-rende/${item.ticker}`">Quanto rende</NuxtLink>
        <NuxtLink :to="`/asset/${item.ticker}`">Ativo</NuxtLink>
      </nav>
    </li>
  </ol>
</template>

<style scoped>
.rcl {
  list-style: none; margin: 20px auto 0; padding: 0; max-width: 980px;
  display: flex; flex-direction: column; gap: 12px;
}
.rcl__item {
  display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1.2fr); gap: 12px 20px;
  align-items: center; min-width: 0; background: var(--nu-card); border-radius: var(--nu-r-panel);
  padding: 16px 18px; box-shadow: var(--nu-shadow-quente);
}
.rcl__quem, .rcl__nums div { min-width: 0; }
.rcl__nome {
  display: flex; align-items: center; gap: 12px; min-width: 0; color: var(--nu-ink); text-decoration: none;
}
.rcl__nome > span { display: flex; flex-direction: column; min-width: 0; }
.rcl__ticker { color: var(--nu-ink); font-size: 15px; font-weight: var(--nu-w-forte); letter-spacing: 0.04em; }
.rcl__empresa {
  color: var(--nu-gray-3); font-size: 13.5px; font-weight: var(--nu-w-texto); line-height: 1.35;
  overflow-wrap: anywhere;
}
.rcl__nome:hover .rcl__ticker { color: var(--nu-blue-text); }
.rcl__nome:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; border-radius: 8px; }
.rcl__nums { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 12px; margin: 0; }
.rcl__nums dt { color: var(--nu-gray); font-size: 12px; font-weight: var(--nu-w-texto); line-height: 1.3; }
.rcl__nums dd {
  margin: 2px 0 0; color: var(--nu-ink); font-size: 15px; font-weight: var(--nu-w-medio);
  font-variant-numeric: tabular-nums; line-height: 1.3; overflow-wrap: anywhere;
}
.rcl__ir { display: flex; flex-wrap: wrap; gap: 8px 16px; grid-column: 1 / -1; }
.rcl__ir a {
  color: var(--nu-blue-text); font-size: 14px; font-weight: var(--nu-w-medio); text-decoration: underline;
  text-underline-offset: 3px; line-height: 1.4;
}
.rcl__ir a:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
@media (max-width: 900px) {
  .rcl__item { grid-template-columns: minmax(0, 1fr); }
}
</style>

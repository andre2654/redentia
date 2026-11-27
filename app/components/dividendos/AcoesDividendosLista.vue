<script setup lang="ts">
// Lista de ações com dividendos. Cada linha leva a /dividendos/{T} e /asset/{T}.
// O número já vem formatado. Sem dado, o slot não chama este componente.
import type { LinhaAcaoDividendo } from '~/utils/acoesDividendos'

defineProps<{
  itens: LinhaAcaoDividendo[]
}>()
</script>

<template>
  <ol v-if="itens.length" class="adl">
    <li v-for="item in itens" :key="item.ticker" class="adl__item">
      <div class="adl__quem">
        <span class="adl__pos">{{ item.pos }}</span>
        <NuxtLink :to="`/asset/${item.ticker}`" class="adl__nome">
          <NuAssetLogo :ticker="item.ticker" :letter="item.ticker.charAt(0)" tile-bg="var(--nu-cream-2)" tile-fg="var(--nu-ink)" :size="36" :radius="10" />
          <span>
            <span class="adl__ticker">{{ item.ticker }}</span>
            <span class="adl__empresa">{{ item.nome }}</span>
            <span v-if="item.pregao" class="adl__pregao">Pregão {{ item.pregao }}</span>
          </span>
        </NuxtLink>
      </div>
      <dl class="adl__nums">
        <div>
          <dt>DY 12 meses</dt>
          <dd>{{ item.dyTexto ?? '—' }}</dd>
        </div>
        <div>
          <dt>Último pagamento</dt>
          <dd>{{ item.ultimoTexto ?? '—' }}</dd>
        </div>
        <div>
          <dt>Meses com pagamento</dt>
          <dd>{{ item.mesesTexto }}</dd>
        </div>
        <div>
          <dt>Setor</dt>
          <dd>{{ item.setor ?? '—' }}</dd>
        </div>
      </dl>
      <nav class="adl__ir" :aria-label="`Páginas de ${item.ticker}`">
        <NuxtLink :to="`/dividendos/${item.ticker}`">Dividendos</NuxtLink>
        <NuxtLink :to="`/asset/${item.ticker}`">Ativo</NuxtLink>
      </nav>
    </li>
  </ol>
</template>

<style scoped>
.adl {
  list-style: none; margin: 20px auto 0; padding: 0; max-width: 980px; width: 100%;
  display: flex; flex-direction: column; gap: 12px;
}
.adl__item {
  display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1.4fr); gap: 12px 20px;
  align-items: center; min-width: 0; background: var(--nu-card); border-radius: var(--nu-r-panel);
  padding: 16px 18px; box-shadow: var(--nu-shadow-quente);
}
.adl__quem { display: flex; align-items: flex-start; gap: 10px; min-width: 0; }
.adl__pos {
  flex: 0 0 auto; width: 1.6em; color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-medio);
  font-variant-numeric: tabular-nums; line-height: 36px;
}
.adl__nome {
  display: flex; align-items: center; gap: 12px; min-width: 0; color: var(--nu-ink); text-decoration: none;
}
.adl__nome > span { display: flex; flex-direction: column; min-width: 0; }
.adl__ticker { color: var(--nu-ink); font-size: 15px; font-weight: var(--nu-w-forte); letter-spacing: 0.04em; }
.adl__empresa, .adl__pregao {
  color: var(--nu-gray-3); font-size: 13.5px; font-weight: var(--nu-w-texto); line-height: 1.35;
  overflow-wrap: anywhere;
}
.adl__pregao { font-size: 12.5px; }
.adl__nome:hover .adl__ticker { color: var(--nu-blue-text); }
.adl__nome:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; border-radius: 8px; }
.adl__nums { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px 12px; margin: 0; }
.adl__nums div { min-width: 0; }
.adl__nums dt { color: var(--nu-gray); font-size: 12px; font-weight: var(--nu-w-texto); line-height: 1.3; overflow-wrap: anywhere; }
.adl__nums dd {
  margin: 2px 0 0; color: var(--nu-ink); font-size: 15px; font-weight: var(--nu-w-medio);
  font-variant-numeric: tabular-nums; line-height: 1.3; overflow-wrap: anywhere;
}
.adl__ir { display: flex; flex-wrap: wrap; gap: 8px 16px; grid-column: 1 / -1; }
.adl__ir a {
  color: var(--nu-blue-text); font-size: 14px; font-weight: var(--nu-w-medio); text-decoration: underline;
  text-underline-offset: 3px; line-height: 1.4;
}
.adl__ir a:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
@media (max-width: 900px) {
  .adl__item { grid-template-columns: minmax(0, 1fr); }
  .adl__nums { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>

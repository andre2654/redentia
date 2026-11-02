<script setup lang="ts">
// Uma linha da lista da /busca (redesenho de 02/11/2026). Anatomia das listas
// da home (HomeRankings): logo, o nome em 800, o dado de apoio em cinza
// embaixo e o número à direita em tabular. Ativo traz o preço e a variação
// do dia que o índice tem; sem número, o lado direito some.
// A linha marcada (teclado ou mouse) ganha o fundo creme: é o mesmo estado
// para os dois, então nunca há duas linhas acesas.
import type { BuscaItem } from '~/composables/useBuscaIndex'

const props = defineProps<{
  item: BuscaItem
  id: string
  ativo: boolean
  /** posição na lista, só para a cor do tile de letra */
  posicao: number
}>()
const emit = defineEmits<{ (e: 'escolher'): void; (e: 'marcar'): void }>()

const capaFalhou = ref(false)
const tile = computed(() => tileFor(props.item.ticker ?? props.item.titulo, null, props.posicao))
</script>

<template>
  <NuxtLink
    :id="props.id"
    :to="props.item.href"
    class="bl"
    :class="{ 'bl--ativo': props.ativo }"
    role="option"
    :aria-selected="props.ativo"
    @click="emit('escolher')"
    @mousemove="!props.ativo && emit('marcar')"
  >
    <NuAssetLogo
      v-if="props.item.tipo === 'ativo' && props.item.ticker"
      :ticker="props.item.ticker" :letter="props.item.ticker.charAt(0)"
      :tile-bg="tile[0]" :tile-fg="tile[1]"
      :size="40" :radius="12"
    />
    <span v-else-if="props.item.tipo === 'tese'" class="bl__icone bl__icone--capa">
      <img
        v-if="props.item.imagem && !capaFalhou" :src="props.item.imagem" alt=""
        loading="lazy" @error="capaFalhou = true"
      >
    </span>
    <span v-else class="bl__icone" aria-hidden="true">
      <!-- Tesouro: o prédio; guia: o livro -->
      <svg v-if="props.item.tipo === 'tesouro'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18M12 3l9 5H3z" /></svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></svg>
    </span>

    <span class="bl__id">
      <span class="bl__titulo" :class="{ 'bl__titulo--quebra': props.item.tipo !== 'ativo' }">{{ props.item.titulo }}</span>
      <span v-if="props.item.sub" class="bl__sub">{{ props.item.sub }}</span>
    </span>

    <span v-if="props.item.valor" class="bl__num">
      <span class="bl__valor" :class="{ 'bl__valor--leve': props.item.tipo === 'guia' }">{{ props.item.valor }}</span>
      <span
        v-if="props.item.pct" class="bl__pct"
        :class="props.item.dir === 'down' ? 'bl__pct--down' : 'bl__pct--up'"
      >{{ props.item.pct }}</span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.bl {
  display: flex; align-items: center; gap: 14px;
  min-height: 64px; padding: 10px 12px; margin: 0 -12px;
  border-radius: 14px; color: var(--nu-ink);
  transition: background .15s;
}
.bl--ativo { background: var(--nu-cream); }
.bl:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.bl__icone {
  flex: none; width: 40px; height: 40px; border-radius: 12px; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-cream); color: var(--nu-gray-2);
}
.bl--ativo .bl__icone:not(.bl__icone--capa) { background: var(--nu-white); }
.bl__icone--capa { background: var(--nu-navy); }
.bl__icone--capa img { width: 100%; height: 100%; object-fit: cover; display: block; }

.bl__id { flex: 1; min-width: 0; }
.bl__titulo {
  display: block; font-size: var(--nu-fs-md); font-weight: 800; line-height: 1.3;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
/* título de Tesouro, tese e guia é frase: quebra em até duas linhas em vez de
   cortar o vencimento ("Tesouro IPCA+ com Juros Semestrais 2035") */
.bl__titulo--quebra {
  white-space: normal; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;
}
.bl__sub {
  display: block; margin-top: 2px; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.bl__num { flex: none; display: flex; flex-direction: column; align-items: flex-end; text-align: right; }
.bl__valor { font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.bl__valor--leve { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 700; }
.bl__pct { margin-top: 2px; font-size: var(--nu-fs-dense); font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
.bl__pct--up { color: var(--nu-green-text); }
.bl__pct--down { color: var(--nu-red-text); }
</style>

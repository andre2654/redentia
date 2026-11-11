<script setup lang="ts">
// Uma linha da lista da /busca (redesenho de 02/11/2026). Anatomia das listas
// da home (HomeRankings): logo, o nome em 800, o dado de apoio em cinza
// embaixo e o número à direita em tabular. Ativo traz o preço e a variação
// do dia que o índice tem; sem número, o lado direito some.
// A linha marcada (teclado ou mouse) ganha o fundo creme: é o mesmo estado
// para os dois, então nunca há duas linhas acesas.
// 2ª rodada da Aportou (11/11/2026): o ticker do ativo vai na etiqueta carvão
// (como nas tabelas de mercado) e a variação do dia no selo de raio 8.
// `data-sem-espiar` (03/11/2026): a busca é o "ir até o ativo", e o Enter já
// navega direto (busca.vue); o clique faz o mesmo, sem a janelinha de espiar.
// Robustez (11/11/2026): a resposta ao digitar fica à vista: o trecho que
// casou com a busca acende em cobalto no nome (a mesma régua do índice: sem
// acento e sem caixa). A linha marcada troca de fundo em --nu-dur-rapida;
// apertada, escurece; a linha que chega entra com um fade curto.
import type { BuscaItem } from '~/composables/useBuscaIndex'
import { normBusca } from '~/utils/buscaRanking'

const props = defineProps<{
  item: BuscaItem
  id: string
  ativo: boolean
  /** posição na lista, só para a cor do tile de letra */
  posicao: number
  /** o que a pessoa digitou: o trecho que casa acende no nome */
  termo?: string
}>()
const emit = defineEmits<{ (e: 'escolher'): void; (e: 'marcar'): void }>()

const capaFalhou = ref(false)
const tile = computed(() => tileFor(props.item.ticker ?? props.item.titulo, null, props.posicao))

/** O texto em trechos, com o primeiro que casa com o termo marcado. Letra a letra, a posição do original é a do normalizado. */
function trechos(texto: string | undefined | null): { t: string; casa: boolean }[] {
  const cru = texto ?? ''
  const q = normBusca((props.termo ?? '').trim())
  if (!cru || !q) return [{ t: cru, casa: false }]
  const letras = Array.from(cru)
  const norm = letras.map((c) => normBusca(c).charAt(0) || '\u0000').join('')
  const i = norm.indexOf(q)
  if (i < 0) return [{ t: cru, casa: false }]
  const fim = i + Array.from(q).length
  return [
    { t: letras.slice(0, i).join(''), casa: false },
    { t: letras.slice(i, fim).join(''), casa: true },
    { t: letras.slice(fim).join(''), casa: false },
  ].filter((p) => p.t)
}
const titulo = computed(() => trechos(props.item.titulo))
const sub = computed(() => trechos(props.item.sub))
</script>

<template>
  <NuxtLink
    :id="props.id"
    :to="props.item.href"
    data-sem-espiar
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
      <span v-if="props.item.tipo === 'ativo' && props.item.ticker" class="bl__titulo bl__titulo--tk"><span class="bl__tk">{{ props.item.titulo }}</span></span>
      <span v-else class="bl__titulo" :class="{ 'bl__titulo--quebra': props.item.tipo !== 'ativo' }"><template v-for="(p, k) in titulo" :key="k"><span v-if="p.casa" class="bl__casa">{{ p.t }}</span><template v-else>{{ p.t }}</template></template></span>
      <span v-if="props.item.sub" class="bl__sub"><template v-for="(p, k) in sub" :key="k"><span v-if="p.casa" class="bl__casa">{{ p.t }}</span><template v-else>{{ p.t }}</template></template></span>
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
  min-height: 68px; padding: 10px 12px; margin: 0 -12px;
  border-radius: var(--nu-r-tile); color: var(--nu-ink); -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-rapida) var(--nu-ease-cor);
}
.bl:hover { color: var(--nu-ink); }
.bl--ativo { background: var(--nu-cream-2); }
.bl:active { background: var(--nu-line-2); }
.bl:focus-visible { outline-offset: 0; }
/* o trecho que casou com a busca */
.bl__casa { color: var(--nu-blue-text); }
.bl__sub .bl__casa { font-weight: var(--nu-w-medio); }

.bl__icone {
  flex: none; width: 40px; height: 40px; border-radius: 12px; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-cream-2); color: var(--nu-ink);
}
.bl--ativo .bl__icone:not(.bl__icone--capa) { background: var(--nu-white); }
.bl__icone--capa { background: var(--nu-ink); }
.bl__icone--capa img { width: 100%; height: 100%; object-fit: cover; display: block; }

.bl__id { flex: 1; min-width: 0; }
.bl__titulo {
  display: block; font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); line-height: 1.3;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
/* o ticker na etiqueta carvão */
.bl__titulo--tk { display: flex; overflow: visible; }
.bl__tk {
  display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: var(--nu-r-tag);
  background: var(--nu-ink); color: var(--nu-white); font-size: 13.5px; font-weight: var(--nu-w-forte); letter-spacing: .04em; line-height: 1;
}
/* título de Tesouro, tese e guia é frase: quebra em até duas linhas em vez de
   cortar o vencimento ("Tesouro IPCA+ com Juros Semestrais 2035") */
.bl__titulo--quebra {
  white-space: normal; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;
}
.bl__sub {
  display: block; margin-top: 4px; color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-texto);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.bl__num { flex: none; display: flex; align-items: center; gap: 10px; text-align: right; }
.bl__valor { font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; white-space: nowrap; }
.bl__valor--leve { color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-medio); }
/* a variação do dia no selo de raio 8 */
.bl__pct {
  display: inline-flex; align-items: center; justify-content: flex-end; min-width: 68px; min-height: 28px; padding: 0 9px; border-radius: var(--nu-r-tag);
  font-size: 14.5px; font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; white-space: nowrap;
}
.bl__pct--up { background: var(--nu-green-bg); color: var(--nu-green-text); }
.bl__pct--down { background: var(--nu-red-bg); color: var(--nu-red-text); }
@media (max-width: 480px) {
  .bl { gap: 12px; }
  .bl__num { flex-direction: column; align-items: flex-end; gap: 4px; }
  .bl__pct { min-width: 0; min-height: 24px; padding: 0 7px; font-size: 13.5px; }
}
@media (prefers-reduced-motion: reduce) { .bl { transition: none; } }
</style>

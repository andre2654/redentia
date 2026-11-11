<script setup lang="ts">
// Tabela do hub /tesouro — mesma pele da RankTable/RankTesouroTable (card
// branco, headers uppercase, tabular-nums), com a TAXA em destaque (é o
// "preço" de um título público) e a linha inteira navegando pro detalhe
// /tesouro/{slug}. Mobile ≤760: o CONTAINER rola horizontal (a página nunca
// rola no eixo x).
import type { TesouroRowVM } from '~/types/tesouro'

defineProps<{ rows: TesouroRowVM[] }>()
</script>

<template>
  <div class="ttb">
    <table class="ttb__table">
      <thead>
        <tr>
          <th class="ttb__th ttb__th--asset">Título</th>
          <th class="ttb__th ttb__th--num">Indexador</th>
          <th class="ttb__th ttb__th--num">Taxa (a.a.)</th>
          <th class="ttb__th ttb__th--num">Vencimento</th>
          <th class="ttb__th ttb__th--num">Preço de compra</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows" :key="row.slug"
          v-contexto-chat="{ id: `tesouro:${row.slug}`, tipo: 'ativo', rotulo: rotuloCurto(row.name) }"
          class="ttb__row"
          @click="navigateTo(`/tesouro/${row.slug}`)"
        >
          <td class="ttb__cell ttb__cell--asset">
            <NuxtLink :to="`/tesouro/${row.slug}`" class="ttb__link" @click.stop>{{ row.name }}</NuxtLink>
          </td>
          <td class="ttb__cell ttb__cell--num"><span class="ttb__badge">{{ row.indexer }}</span></td>
          <td class="ttb__cell ttb__cell--num ttb__cell--rate">{{ row.rateFmt }}</td>
          <td class="ttb__cell ttb__cell--num">{{ row.maturityFmt }}</td>
          <td class="ttb__cell ttb__cell--num">{{ row.priceBuyFmt }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* a tabela da Aportou: cabeçalho em caixa alta espaçada, fios leves de 1,5px, linha que acende em creme */
.ttb { background: var(--nu-white); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-quente); overflow-x: auto; }
.ttb__table { width: 100%; min-width: 680px; border-collapse: collapse; }
.ttb__th {
  padding: 18px 16px 14px; text-align: right; white-space: nowrap;
  color: var(--nu-ink); font-size: 13.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .16em;
  border-bottom: 1.5px solid var(--nu-line-2);
}
.ttb__th--asset { text-align: left; padding-left: clamp(16px, 2vw, 28px); }
.ttb__th--num:last-child { padding-right: clamp(16px, 2vw, 28px); }
.ttb__row { cursor: pointer; transition: background .15s; }
.ttb__row:hover { background: var(--nu-page); }
.ttb__row:hover .ttb__link { color: var(--nu-blue-text); }
.ttb__row + .ttb__row .ttb__cell { border-top: 1.5px solid var(--nu-line-2); }
.ttb__cell {
  padding: 14px 16px; text-align: right; white-space: nowrap;
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.ttb__cell--asset { text-align: left; padding-left: clamp(16px, 2vw, 28px); }
.ttb__link { color: var(--nu-ink); font-weight: 800; letter-spacing: -.01em; transition: color .2s ease; }
.ttb__link:hover { color: var(--nu-blue-text); }
.ttb__cell--rate { color: var(--nu-ink); font-weight: 800; }
.ttb__cell--num:last-child { padding-right: clamp(16px, 2vw, 28px); }
.ttb__badge {
  display: inline-flex; background: var(--nu-cream-2); color: var(--nu-gray-3);
  border-radius: var(--nu-r-tag); padding: 4px 9px; font-size: 13.5px; font-weight: 700;
}
</style>

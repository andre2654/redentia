<script setup lang="ts">
// Tabela do hub /tesouro — mesma pele da RankTable/RankTesouroTable (card
// branco, headers uppercase, tabular-nums), com a TAXA em destaque (é o
// "preço" de um título público) e a linha inteira navegando pro detalhe
// /tesouro/{slug}. Mobile ≤760: o CONTAINER rola horizontal (a página nunca
// rola no eixo x), com o título preso à esquerda e a taxa como primeira coluna
// (2ª rodada da Aportou, 11/11/2026).
import type { TesouroRowVM } from '~/types/tesouro'

defineProps<{ rows: TesouroRowVM[] }>()
</script>

<template>
  <div class="ttb">
    <table class="ttb__table">
      <thead>
        <tr>
          <th class="ttb__th ttb__th--asset">Título</th>
          <th class="ttb__th ttb__th--num ttb__th--main">Taxa (a.a.)</th>
          <th class="ttb__th ttb__th--num">Indexador</th>
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
          <td class="ttb__cell ttb__cell--num ttb__cell--rate">{{ row.rateFmt }}</td>
          <td class="ttb__cell ttb__cell--num"><span class="ttb__badge">{{ row.indexer }}</span></td>
          <td class="ttb__cell ttb__cell--num">{{ row.maturityFmt }}</td>
          <td class="ttb__cell ttb__cell--num">{{ row.priceBuyFmt }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* a tabela da Aportou: cartão branco, cabeçalho em caixa alta espaçada 13,5px,
   fios leves de 1,5px, a linha que acende em creme. A TAXA (o "preço" de um
   título público) vem logo depois do nome, em 800; o indexador num selo de raio 8.
   No celular o título fica preso à esquerda e as outras colunas rolam por baixo. */
.ttb { background: var(--nu-white); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-quente); overflow-x: auto; scrollbar-width: thin; }
.ttb__table { width: 100%; min-width: 680px; border-collapse: separate; border-spacing: 0; }
.ttb__th {
  padding: 18px 16px 14px; text-align: right; white-space: nowrap;
  color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-medio);
  text-transform: uppercase; letter-spacing: .16em;
  border-bottom: 1px solid var(--nu-line-2);
}
.ttb__th--pos { width: 52px; text-align: left; padding-left: clamp(16px, 2vw, 28px); }
.ttb__th--asset { text-align: left; padding-left: clamp(16px, 2vw, 28px); }
.ttb__th--main { color: var(--nu-ink); }
.ttb__th--num:last-child { padding-right: clamp(16px, 2vw, 28px); }
.ttb__row { cursor: pointer; transition: background .15s; }
.ttb__row:hover { background: var(--nu-page); }
.ttb__row:hover .ttb__link { color: var(--nu-blue-text); }
.ttb__row + .ttb__row .ttb__cell { border-top: 1px solid var(--nu-line-2); }
.ttb__cell {
  padding: 14px 16px; text-align: right; white-space: nowrap;
  color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.ttb__cell--pos {
  width: 52px; text-align: left; padding-left: clamp(16px, 2vw, 28px);
  color: var(--nu-gray); font-size: 14.5px; font-weight: var(--nu-w-medio);
}
.ttb__cell--asset { text-align: left; font-weight: var(--nu-w-forte); letter-spacing: -.01em; padding-left: clamp(16px, 2vw, 28px); }
.ttb__link { color: var(--nu-ink); transition: color .2s ease; }
.ttb__link:hover { color: var(--nu-blue-text); }
.ttb__cell--rate { color: var(--nu-ink); font-size: 17px; font-weight: var(--nu-w-forte); letter-spacing: -0.01em; }
.ttb__cell--num:last-child { padding-right: clamp(16px, 2vw, 28px); }
.ttb__badge {
  display: inline-flex; align-items: center; min-height: 26px; background: var(--nu-cream-2); color: var(--nu-gray-3);
  border-radius: var(--nu-r-tag); padding: 0 9px; font-size: 13.5px; font-weight: var(--nu-w-medio);
}
@media (max-width: 760px) {
  .ttb__table { min-width: 0; }
  .ttb__th, .ttb__cell { padding-left: 10px; padding-right: 10px; }
  /* alturas inteiras: a coluna presa é composta à parte, e meia fração de pixel desalinha o fio */
  .ttb__th { height: 48px; padding-top: 0; padding-bottom: 0; line-height: 16px; }
  .ttb__cell { padding-top: 14px; padding-bottom: 14px; line-height: 20px; }
  .ttb__th--asset, .ttb__cell--asset {
    position: sticky; left: 0; z-index: 2; background: var(--nu-white); padding-left: 16px;
    box-shadow: 8px 0 10px -8px color-mix(in srgb, var(--nu-ink) 14%, transparent);
  }
  .ttb__cell--asset { white-space: normal; min-width: 148px; max-width: 168px; font-size: 15px; line-height: 20px; }
  .ttb__row:hover .ttb__cell--pos, .ttb__row:hover .ttb__cell--asset { background: var(--nu-page); }
  .ttb__cell--rate { font-size: 16px; }
  .ttb__th--num:last-child, .ttb__cell--num:last-child { padding-right: 16px; }
}
@media (prefers-reduced-motion: reduce) { .ttb__row, .ttb__link { transition: none; } }
</style>

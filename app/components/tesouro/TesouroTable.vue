<script setup lang="ts">
// Tabela do hub /tesouro — mesma pele da RankTable/RankTesouroTable (card
// branco, headers uppercase, tabular-nums), com a TAXA em destaque (é o
// "preço" de um título público) e a linha inteira navegando pro detalhe
// /tesouro/{slug}. Mobile ≤760: o CONTAINER rola horizontal (a página nunca
// rola no eixo x), com o título preso à esquerda e a taxa como primeira coluna
// (2ª rodada da Aportou, 11/11/2026).
// Robustez (11/11/2026): é a pele das tabelas de mercado (tabela-mercado.css,
// a mesma do ranking): cabeçalho que gruda ao rolar os 70 títulos, linhas de
// 56px, o indexador no NuSelo e a seta que aparece quando a linha acende. Numa
// troca de indexador a lista de antes fica esmaecida (`ocupada`) até a nova chegar.
import type { TesouroRowVM } from '~/types/tesouro'

defineProps<{
  rows: TesouroRowVM[]
  /** o filtro novo está chegando: a lista de agora fica, esmaecida */
  ocupada?: boolean
}>()
</script>

<template>
  <div class="rkt rkt--sem-pos" :class="{ 'rkt--ocupada': ocupada }" :aria-busy="ocupada || undefined">
    <table class="rkt__table">
      <thead>
        <tr>
          <th class="rkt__th rkt__th--asset rkt__th--borda" scope="col">Título</th>
          <th class="rkt__th rkt__th--num rkt__th--main" scope="col">Taxa (a.a.)</th>
          <th class="rkt__th rkt__th--num" scope="col">Indexador</th>
          <th class="rkt__th rkt__th--num" scope="col">Vencimento</th>
          <th class="rkt__th rkt__th--num" scope="col">Preço de compra</th>
          <td class="rkt__th rkt__th--ir" aria-hidden="true" />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows" :key="row.slug"
          v-contexto-chat="{ id: `tesouro:${row.slug}`, tipo: 'ativo', rotulo: rotuloCurto(row.name) }"
          class="rkt__row"
          @click="navigateTo(`/tesouro/${row.slug}`)"
        >
          <td class="rkt__cell rkt__cell--asset rkt__cell--borda rkt__cell--titulo">
            <NuxtLink :to="`/tesouro/${row.slug}`" class="rkt__nome" @click.stop>{{ row.name }}</NuxtLink>
          </td>
          <td class="rkt__cell rkt__cell--num rkt__cell--main">{{ row.rateFmt }}</td>
          <td class="rkt__cell rkt__cell--num"><NuSelo>{{ row.indexer }}</NuSelo></td>
          <td class="rkt__cell rkt__cell--num">{{ row.maturityFmt }}</td>
          <td class="rkt__cell rkt__cell--num">{{ row.priceBuyFmt }}</td>
          <td class="rkt__cell rkt__cell--ir" aria-hidden="true">
            <svg class="rkt__ir" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped src="../ranking/tabela-mercado.css"></style>
<style scoped>
/* sem a coluna da posição: o título abre a linha com o respiro da ponta */
.rkt__th--borda, .rkt__cell--borda { padding-left: var(--rkt-borda); }
/* o nome do título no celular quebra em até três linhas, preso à esquerda */
@media (max-width: 760px) {
  .rkt__cell--titulo { white-space: normal; min-width: 148px; max-width: 168px; }
}
</style>

<script setup lang="ts">
// Tabela do caso especial tesouro-direto (renda fixa não tem /rankings/* no
// backend — deriva de GET /tesouro ordenado por rate_numeric): título,
// indexador, taxa, vencimento e preço. Linha inteira navega pro detalhe
// /tesouro/{slug} (as páginas do Tesouro existem desde a frente E do
// PLANO-REFINO-POS-ATLAS). Mesma pele da RankTable. 2ª rodada da Aportou
// (11/11/2026): a taxa vem logo depois do título, em destaque, e no celular o
// título fica preso à esquerda.
// Robustez (11/11/2026): a pele das tabelas de mercado (tabela-mercado.css),
// com o indexador no NuSelo e a seta que aparece quando a linha acende.
import type { TesouroRankingRow } from '~/types/rankings'

defineProps<{ rows: TesouroRankingRow[] }>()
// o sujeito do chip do chat (proverSobreDoContexto na página)
const sobre = useSobreDoContexto()

const nfBrl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function fmtMaturity(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return d && m && y ? `${d}/${m}/${y}` : iso
}
</script>

<template>
  <div class="rkt">
    <table class="rkt__table">
      <thead>
        <tr>
          <th class="rkt__th rkt__th--pos" scope="col">#</th>
          <th class="rkt__th rkt__th--asset" scope="col">Título</th>
          <th class="rkt__th rkt__th--num rkt__th--main" scope="col">Taxa</th>
          <th class="rkt__th rkt__th--num" scope="col">Indexador</th>
          <th class="rkt__th rkt__th--num" scope="col">Vencimento</th>
          <th class="rkt__th rkt__th--num" scope="col">Preço</th>
          <td class="rkt__th rkt__th--ir" aria-hidden="true" />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in rows" :key="row.slug"
          v-contexto-chat="{ id: `ranking-tesouro:${sobre}:${row.slug}`, tipo: 'ranking', rotulo: rotuloCurto(`${i + 1}º ${row.name}`) }"
          class="rkt__row"
          @click="navigateTo(`/tesouro/${row.slug}`)"
        >
          <td class="rkt__cell rkt__cell--pos">{{ i + 1 }}</td>
          <td class="rkt__cell rkt__cell--asset rkt__cell--titulo">
            <NuxtLink :to="`/tesouro/${row.slug}`" class="rkt__nome" @click.stop>{{ row.name }}</NuxtLink>
          </td>
          <td class="rkt__cell rkt__cell--num rkt__cell--main">{{ row.rate }}</td>
          <td class="rkt__cell rkt__cell--num"><NuSelo>{{ row.indexer }}</NuSelo></td>
          <td class="rkt__cell rkt__cell--num">{{ fmtMaturity(row.maturity) }}</td>
          <td class="rkt__cell rkt__cell--num">{{ row.priceBuy == null ? '—' : nfBrl.format(row.priceBuy) }}</td>
          <td class="rkt__cell rkt__cell--ir" aria-hidden="true">
            <svg class="rkt__ir" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped src="./tabela-mercado.css"></style>
<style scoped>
/* o nome do título no celular quebra em até três linhas, preso à esquerda */
@media (max-width: 760px) {
  .rkt__cell--titulo { white-space: normal; min-width: 148px; max-width: 168px; }
}
</style>

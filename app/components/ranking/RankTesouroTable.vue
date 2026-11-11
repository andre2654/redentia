<script setup lang="ts">
// Tabela do caso especial tesouro-direto (renda fixa não tem /rankings/* no
// backend — deriva de GET /tesouro ordenado por rate_numeric): título,
// indexador, taxa, vencimento e preço. Linha inteira navega pro detalhe
// /tesouro/{slug} (as páginas do Tesouro existem desde a frente E do
// PLANO-REFINO-POS-ATLAS). Mesma pele da RankTable. 2ª rodada da Aportou
// (11/11/2026): a taxa vem logo depois do título, em destaque, e no celular o
// título fica preso à esquerda.
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
          <th class="rkt__th rkt__th--pos">#</th>
          <th class="rkt__th rkt__th--asset">Título</th>
          <th class="rkt__th rkt__th--num rkt__th--main">Taxa</th>
          <th class="rkt__th rkt__th--num">Indexador</th>
          <th class="rkt__th rkt__th--num">Vencimento</th>
          <th class="rkt__th rkt__th--num">Preço</th>
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
          <td class="rkt__cell rkt__cell--asset">
            <NuxtLink :to="`/tesouro/${row.slug}`" class="rkt__link" @click.stop>{{ row.name }}</NuxtLink>
          </td>
          <td class="rkt__cell rkt__cell--num rkt__cell--rate">{{ row.rate }}</td>
          <td class="rkt__cell rkt__cell--num"><span class="rkt__badge">{{ row.indexer }}</span></td>
          <td class="rkt__cell rkt__cell--num">{{ fmtMaturity(row.maturity) }}</td>
          <td class="rkt__cell rkt__cell--num">{{ row.priceBuy == null ? '—' : nfBrl.format(row.priceBuy) }}</td>
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
.rkt { background: var(--nu-white); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-quente); overflow-x: auto; scrollbar-width: thin; }
.rkt__table { width: 100%; min-width: 680px; border-collapse: separate; border-spacing: 0; }
.rkt__th {
  padding: 18px 16px 14px; text-align: right; white-space: nowrap;
  color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-medio);
  text-transform: uppercase; letter-spacing: .16em;
  border-bottom: 1px solid var(--nu-line-2);
}
.rkt__th--pos { width: 52px; text-align: left; padding-left: clamp(16px, 2vw, 28px); }
.rkt__th--asset { text-align: left; }
.rkt__th--main { color: var(--nu-ink); }
.rkt__th--num:last-child { padding-right: clamp(16px, 2vw, 28px); }
.rkt__row { cursor: pointer; transition: background .15s; }
.rkt__row:hover { background: var(--nu-page); }
.rkt__row:hover .rkt__link { color: var(--nu-blue-text); }
.rkt__row + .rkt__row .rkt__cell { border-top: 1px solid var(--nu-line-2); }
.rkt__cell {
  padding: 14px 16px; text-align: right; white-space: nowrap;
  color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.rkt__cell--pos {
  width: 52px; text-align: left; padding-left: clamp(16px, 2vw, 28px);
  color: var(--nu-gray); font-size: 14.5px; font-weight: var(--nu-w-medio);
}
.rkt__cell--asset { text-align: left; font-weight: var(--nu-w-forte); letter-spacing: -.01em; }
.rkt__link { color: var(--nu-ink); transition: color .2s ease; }
.rkt__link:hover { color: var(--nu-blue-text); }
.rkt__cell--rate { color: var(--nu-ink); font-size: 17px; font-weight: var(--nu-w-forte); letter-spacing: -0.01em; }
.rkt__cell--num:last-child { padding-right: clamp(16px, 2vw, 28px); }
.rkt__badge {
  display: inline-flex; align-items: center; min-height: 26px; background: var(--nu-cream-2); color: var(--nu-gray-3);
  border-radius: var(--nu-r-tag); padding: 0 9px; font-size: 13.5px; font-weight: var(--nu-w-medio);
}
@media (max-width: 760px) {
  .rkt__table { min-width: 0; }
  .rkt__th, .rkt__cell { padding-left: 10px; padding-right: 10px; }
  /* alturas inteiras: a coluna presa é composta à parte, e meia fração de pixel desalinha o fio */
  .rkt__th { height: 48px; padding-top: 0; padding-bottom: 0; line-height: 16px; }
  .rkt__cell { padding-top: 14px; padding-bottom: 14px; line-height: 20px; }
  .rkt__th--pos, .rkt__cell--pos { width: 34px; min-width: 34px; padding-left: 14px; padding-right: 0; position: sticky; left: 0; z-index: 2; background: var(--nu-white); }
  .rkt__th--asset, .rkt__cell--asset {
    position: sticky; left: 34px; z-index: 2; background: var(--nu-white); padding-left: 8px;
    box-shadow: 8px 0 10px -8px color-mix(in srgb, var(--nu-ink) 14%, transparent);
  }
  .rkt__cell--asset { white-space: normal; min-width: 148px; max-width: 168px; font-size: 15px; line-height: 20px; }
  .rkt__row:hover .rkt__cell--pos, .rkt__row:hover .rkt__cell--asset { background: var(--nu-page); }
  .rkt__cell--rate { font-size: 16px; }
  .rkt__th--num:last-child, .rkt__cell--num:last-child { padding-right: 16px; }
}
@media (prefers-reduced-motion: reduce) { .rkt__row, .rkt__link { transition: none; } }
</style>

<script setup lang="ts">
// Tabela do caso especial tesouro-direto (renda fixa não tem /rankings/* no
// backend — deriva de GET /tesouro ordenado por rate_numeric): título,
// indexador, taxa, vencimento e preço. Linha inteira navega pro detalhe
// /tesouro/{slug} (as páginas do Tesouro existem desde a frente E do
// PLANO-REFINO-POS-ATLAS). Mesma pele da RankTable.
import type { TesouroRankingRow } from '~/types/rankings'

defineProps<{ rows: TesouroRankingRow[] }>()

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
          <th class="rkt__th rkt__th--num">Indexador</th>
          <th class="rkt__th rkt__th--num">Taxa</th>
          <th class="rkt__th rkt__th--num">Vencimento</th>
          <th class="rkt__th rkt__th--num">Preço</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in rows" :key="row.slug" class="rkt__row"
          @click="navigateTo(`/tesouro/${row.slug}`)"
        >
          <td class="rkt__cell rkt__cell--pos">{{ i + 1 }}</td>
          <td class="rkt__cell rkt__cell--asset">
            <NuxtLink :to="`/tesouro/${row.slug}`" class="rkt__link" @click.stop>{{ row.name }}</NuxtLink>
          </td>
          <td class="rkt__cell rkt__cell--num"><span class="rkt__badge">{{ row.indexer }}</span></td>
          <td class="rkt__cell rkt__cell--num rkt__cell--rate">{{ row.rate }}</td>
          <td class="rkt__cell rkt__cell--num">{{ fmtMaturity(row.maturity) }}</td>
          <td class="rkt__cell rkt__cell--num">{{ row.priceBuy == null ? '—' : nfBrl.format(row.priceBuy) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.rkt { background: var(--nu-white); border-radius: var(--nu-r-card-lg); overflow-x: auto; }
.rkt__table { width: 100%; min-width: 680px; border-collapse: collapse; }
.rkt__th {
  padding: 18px 16px 14px; text-align: right; white-space: nowrap;
  color: var(--nu-gray); font-size: 12px; font-weight: 800;
  text-transform: uppercase; letter-spacing: .08em;
  border-bottom: 1px solid var(--nu-cream-2);
}
.rkt__th--pos { width: 52px; text-align: left; padding-left: clamp(16px, 2vw, 28px); }
.rkt__th--asset { text-align: left; }
.rkt__th--num:last-child { padding-right: clamp(16px, 2vw, 28px); }
.rkt__row { cursor: pointer; transition: background .15s; }
.rkt__row:hover { background: var(--nu-cream-hover); }
.rkt__row + .rkt__row .rkt__cell { border-top: 1px solid var(--nu-cream-2); }
.rkt__cell {
  padding: 14px 16px; text-align: right; white-space: nowrap;
  color: var(--nu-ink); font-size: 15px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.rkt__cell--pos {
  width: 52px; text-align: left; padding-left: clamp(16px, 2vw, 28px);
  color: var(--nu-gray); font-size: 13.5px; font-weight: 800;
}
.rkt__cell--asset { text-align: left; font-weight: 800; letter-spacing: -.1px; }
.rkt__link { color: var(--nu-ink); }
.rkt__link:hover { color: var(--nu-blue); }
.rkt__cell--rate { color: var(--nu-blue); font-weight: 800; }
.rkt__cell--num:last-child { padding-right: clamp(16px, 2vw, 28px); }
.rkt__badge {
  display: inline-flex; background: var(--nu-sand-2); color: var(--nu-gray-tag);
  border-radius: var(--nu-r-chip); padding: 4px 10px; font-size: 12px; font-weight: 800;
}
</style>

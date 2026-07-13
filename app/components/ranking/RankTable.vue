<script setup lang="ts">
// Tabela do ranking — colunas fixas (#, Ativo com NuAssetLogo, Cotação) +
// colunas configuráveis por meta.columns (formatters em utils/rankings.ts).
// Linha inteira navega pro /asset/<ticker>. tabular-nums em todo número.
// Mobile ≤760: o CONTAINER rola horizontal (a página nunca rola no eixo x).
//
// breakdown (só o redentia-score): coluna extra 'Ver detalhe'/'Ocultar' que
// expande a linha com os chips de posição (#N) nos 15 rankings que compõem o
// score (SCORE_BREAKDOWN_MAP em utils/rankings.ts) — portado da página
// dedicada da Redentia antiga (redentia-score.vue), inclusive o fallback
// 'Sem detalhes disponíveis para este ativo.'
import type { RankingColumnKey, RankingRowApi } from '~/types/rankings'

const props = defineProps<{
  rows: RankingRowApi[]
  columns: RankingColumnKey[]
  /** label da coluna change ('Hoje' default; '30d'/'12m' nos momentum). */
  changeLabel?: string
  /** habilita a coluna/linha de breakdown por ranking (redentia-score). */
  breakdown?: boolean
}>()

const expandedTicker = ref<string | null>(null)
function toggleBreakdown(ticker: string) {
  expandedTicker.value = expandedTicker.value === ticker ? null : ticker
}
function breakdownEntries(row: RankingRowApi): [string, number][] {
  return Object.entries(row.ranking_breakdown ?? {})
}

const defs = computed(() =>
  props.columns.map((key) => ({
    key,
    def: RANKING_COLUMNS[key],
    label: key === 'change' && props.changeLabel ? props.changeLabel : RANKING_COLUMNS[key].label,
  })),
)

function cellTone(key: RankingColumnKey, row: RankingRowApi): string {
  const def = RANKING_COLUMNS[key]
  if (!def.signed) return ''
  const v = def.raw(row) ?? 0
  return v < 0 ? 'rkt__cell--down' : 'rkt__cell--up'
}
</script>

<template>
  <div class="rkt">
    <table class="rkt__table">
      <thead>
        <tr>
          <th class="rkt__th rkt__th--pos">#</th>
          <th class="rkt__th rkt__th--asset">Ativo</th>
          <th class="rkt__th rkt__th--num">Cotação</th>
          <th v-for="c in defs" :key="c.key" class="rkt__th rkt__th--num">{{ c.label }}</th>
          <th v-if="breakdown" class="rkt__th rkt__th--num">Breakdown</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row, i) in rows" :key="rankingTicker(row) || i">
          <tr
            class="rkt__row"
            @click="navigateTo(`/asset/${rankingTicker(row)}`)"
          >
            <td class="rkt__cell rkt__cell--pos">{{ i + 1 }}</td>
            <td class="rkt__cell rkt__cell--asset">
              <NuxtLink :to="`/asset/${rankingTicker(row)}`" class="rkt__asset" @click.stop>
                <NuAssetLogo
                  :ticker="rankingTicker(row)" :letter="rankingTicker(row).charAt(0) || '?'"
                  tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)"
                  :size="40" :radius="12"
                />
                <span class="rkt__asset-id">
                  <span class="rkt__asset-ticker">{{ rankingTicker(row) }}</span>
                  <span v-if="rankingName(row)" class="rkt__asset-name">{{ rankingName(row) }}</span>
                </span>
              </NuxtLink>
            </td>
            <td class="rkt__cell rkt__cell--num">{{ rankingPrice(row) }}</td>
            <td
              v-for="c in defs" :key="c.key"
              class="rkt__cell rkt__cell--num" :class="cellTone(c.key, row)"
            >{{ c.def.format(row) }}</td>
            <td v-if="breakdown" class="rkt__cell rkt__cell--num">
              <button
                type="button" class="rkt__toggle"
                :aria-expanded="expandedTicker === rankingTicker(row)"
                @click.stop="toggleBreakdown(rankingTicker(row))"
              >{{ expandedTicker === rankingTicker(row) ? 'Ocultar' : 'Ver detalhe' }}</button>
            </td>
          </tr>
          <tr v-if="breakdown && expandedTicker === rankingTicker(row)" class="rkt__breakdown-row">
            <td class="rkt__breakdown-cell" :colspan="3 + defs.length + 1">
              <span class="rkt__breakdown-label">Posições nos rankings que compõem o score</span>
              <div v-if="breakdownEntries(row).length" class="rkt__breakdown-chips">
                <NuxtLink
                  v-for="[slug, position] in breakdownEntries(row)" :key="slug"
                  :to="SCORE_BREAKDOWN_MAP[slug]?.url || '/rankings'" class="rkt__chip"
                >
                  <span>{{ SCORE_BREAKDOWN_MAP[slug]?.title || slug }}</span>
                  <span class="rkt__chip-pos">#{{ position }}</span>
                </NuxtLink>
              </div>
              <p v-else class="rkt__breakdown-empty">Sem detalhes disponíveis para este ativo.</p>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* container rola no eixo x; a página nunca (regra dura de responsivo) */
.rkt { background: var(--nu-white); border-radius: var(--nu-r-card-lg); overflow-x: auto; }
.rkt__table { width: 100%; min-width: 720px; border-collapse: collapse; }
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
.rkt__row:hover { background: var(--nu-cream); }
/* :not(:first-child) e não sibling: a linha de breakdown expandida não pode
   quebrar a cadeia de bordas entre linhas. */
.rkt__row:not(:first-child) .rkt__cell { border-top: 1px solid var(--nu-cream-2); }

.rkt__cell {
  padding: 13px 16px; text-align: right; white-space: nowrap;
  color: var(--nu-ink); font-size: 15px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.rkt__cell--pos {
  width: 52px; text-align: left; padding-left: clamp(16px, 2vw, 28px);
  color: var(--nu-gray); font-size: 13.5px; font-weight: 800;
}
.rkt__cell--asset { text-align: left; }
.rkt__cell--num:last-child { padding-right: clamp(16px, 2vw, 28px); }
.rkt__cell--up { color: var(--nu-green); }
.rkt__cell--down { color: var(--nu-red); }

/* ——— breakdown expansível (redentia-score) ——— */
.rkt__toggle {
  background: none; border: 0; padding: 0; cursor: pointer;
  color: var(--nu-blue); font-size: 13.5px; font-weight: 800;
  font-family: inherit; white-space: nowrap;
}
.rkt__toggle:hover { text-decoration: underline; }
.rkt__breakdown-cell {
  padding: 16px clamp(16px, 2vw, 28px) 20px;
  background: var(--nu-cream); border-top: 1px solid var(--nu-cream-2);
}
.rkt__breakdown-label {
  display: block; margin-bottom: 12px;
  color: var(--nu-gray); font-size: 11.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: .12em;
}
.rkt__breakdown-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.rkt__chip {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-white); border: 1px solid var(--nu-cream-2);
  border-radius: var(--nu-r-pill); padding: 7px 14px;
  color: var(--nu-ink); font-size: 13px; font-weight: 700;
  white-space: nowrap; transition: border-color .15s;
}
.rkt__chip:hover { border-color: var(--nu-blue); }
.rkt__chip-pos { color: var(--nu-blue); font-weight: 800; font-variant-numeric: tabular-nums; }
.rkt__breakdown-empty { margin: 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }

.rkt__asset { display: flex; align-items: center; gap: 12px; min-width: 0; }
.rkt__asset-id { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.rkt__asset-ticker { color: var(--nu-ink); font-size: 15px; font-weight: 800; letter-spacing: -.1px; }
.rkt__asset-name {
  color: var(--nu-gray); font-size: 12.5px; font-weight: 600;
  max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

@media (max-width: 760px) {
  .rkt__asset-name { max-width: 150px; }
}
</style>

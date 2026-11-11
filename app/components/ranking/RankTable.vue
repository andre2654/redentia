<script setup lang="ts">
// Tabela do ranking — colunas fixas (#, Ativo com NuAssetLogo, Cotação) +
// colunas configuráveis por meta.columns (formatters em utils/rankings.ts).
// Linha inteira leva ao /asset/<ticker> (pela janelinha de espiar). tabular-nums em todo número.
// Mobile ≤760: o CONTAINER rola horizontal (a página nunca rola no eixo x).
//
// breakdown (só o redentia-score): coluna extra 'Ver detalhe'/'Ocultar' que
// expande a linha com os chips de posição (#N) nos 15 rankings que compõem o
// score (SCORE_BREAKDOWN_MAP em utils/rankings.ts) — portado da página
// dedicada da Redentia antiga (redentia-score.vue), inclusive o fallback
// 'Sem detalhes disponíveis para este ativo.'
//
// 2ª rodada da Aportou (11/11/2026): o ticker vai numa etiqueta carvão, a
// variação (colunas com sinal) num selo de raio 8, e a coluna da métrica do
// ranking (`primary`) vem logo depois do ativo, em 800: é o número que a pessoa
// veio ver. No celular o ativo fica preso à esquerda e as outras colunas rolam
// por baixo dele, então esse número aparece sem arrastar. Os dados, as colunas
// e os links são os de antes; só a ordem das colunas põe a principal na frente.
import type { RankingColumnKey, RankingRowApi } from '~/types/rankings'

const props = defineProps<{
  rows: RankingRowApi[]
  columns: RankingColumnKey[]
  /** label da coluna change ('Hoje' default; '30d'/'12m' nos momentum). */
  changeLabel?: string
  /** habilita a coluna/linha de breakdown por ranking (redentia-score). */
  breakdown?: boolean
  /** a métrica do ranking: a coluna dela vem logo depois do ativo, em destaque */
  primary?: RankingColumnKey
}>()
// o sujeito do chip do chat (proverSobreDoContexto na página)
const sobre = useSobreDoContexto()

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
// a coluna principal (quando está entre as colunas) e as demais, na ordem de sempre
const principal = computed(() => defs.value.find((c) => c.key === props.primary) ?? null)
const demais = computed(() => defs.value.filter((c) => c.key !== principal.value?.key))

/**
 * A linha inteira leva ao ativo. Desde 03/11/2026 o clique passa pelo link da
 * própria linha, e aí vale a janelinha de espiar (plugins/espiar-ativo.client)
 * como em qualquer link de ativo do site. Com Cmd/Ctrl/Shift/Alt a linha
 * navega como antes. O @click.stop do link evita o clique voltar à linha.
 */
function clicarLinha(e: MouseEvent, ticker: string) {
  const link = (e.currentTarget as HTMLElement | null)?.querySelector<HTMLAnchorElement>('a.rkt__asset')
  if (link && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) { link.click(); return }
  void navigateTo(`/asset/${ticker}`)
}

/** o tom do selo das colunas com sinal ('' = número sem selo; sem dado, sem selo) */
function cellTone(key: RankingColumnKey, row: RankingRowApi): '' | 'up' | 'down' | 'flat' {
  const def = RANKING_COLUMNS[key]
  if (!def.signed) return ''
  const v = def.raw(row)
  if (v == null) return ''
  // o que arredonda para zero fica no selo neutro
  if (Math.abs(v) < 0.05) return 'flat'
  return v < 0 ? 'down' : 'up'
}
</script>

<template>
  <div class="rkt">
    <table class="rkt__table">
      <thead>
        <tr>
          <th class="rkt__th rkt__th--pos">#</th>
          <th class="rkt__th rkt__th--asset">Ativo</th>
          <th v-if="principal" class="rkt__th rkt__th--num rkt__th--main">{{ principal.label }}</th>
          <th class="rkt__th rkt__th--num">Cotação</th>
          <th v-for="c in demais" :key="c.key" class="rkt__th rkt__th--num">{{ c.label }}</th>
          <th v-if="breakdown" class="rkt__th rkt__th--num">Breakdown</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row, i) in rows" :key="rankingTicker(row) || i">
          <tr
            v-contexto-chat="{ id: `ranking-linha:${sobre}:${rankingTicker(row)}`, tipo: 'ranking', rotulo: rotuloCurto(`${i + 1}º ${rankingTicker(row)}${sobre ? ` · ${sobre}` : ''}`) }"
            class="rkt__row"
            @click="clicarLinha($event, rankingTicker(row))"
          >
            <td class="rkt__cell rkt__cell--pos">{{ i + 1 }}</td>
            <td class="rkt__cell rkt__cell--asset">
              <NuxtLink :to="`/asset/${rankingTicker(row)}`" class="rkt__asset" @click.stop>
                <NuAssetLogo
                  class="rkt__logo"
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
            <td v-if="principal" class="rkt__cell rkt__cell--num rkt__cell--main">
              <span v-if="cellTone(principal.key, row)" class="rkt__selo" :class="`rkt__selo--${cellTone(principal.key, row)}`">{{ principal.def.format(row) }}</span>
              <template v-else>{{ principal.def.format(row) }}</template>
            </td>
            <td class="rkt__cell rkt__cell--num">{{ rankingPrice(row) }}</td>
            <td v-for="c in demais" :key="c.key" class="rkt__cell rkt__cell--num">
              <span v-if="cellTone(c.key, row)" class="rkt__selo" :class="`rkt__selo--${cellTone(c.key, row)}`">{{ c.def.format(row) }}</span>
              <template v-else>{{ c.def.format(row) }}</template>
            </td>
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
/* a tabela da Aportou: cartão branco, cabeçalho em caixa alta espaçada 13,5px,
   fios leves de 1,5px e a linha que acende em creme */
.rkt { background: var(--nu-white); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-quente); overflow-x: auto; scrollbar-width: thin; }
.rkt__table { width: 100%; min-width: 720px; border-collapse: separate; border-spacing: 0; }
.rkt__th {
  padding: 18px 16px 14px; text-align: right; white-space: nowrap;
  color: var(--nu-gray); font-size: 13.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .16em;
  border-bottom: 1.5px solid var(--nu-line-2);
}
.rkt__th--pos { width: 52px; text-align: left; padding-left: clamp(16px, 2vw, 28px); }
.rkt__th--asset { text-align: left; }
.rkt__th--main { color: var(--nu-ink); }
.rkt__th--num:last-child { padding-right: clamp(16px, 2vw, 28px); }

.rkt__row { cursor: pointer; transition: background .15s; }
.rkt__row:hover { background: var(--nu-page); }
.rkt__row:hover .rkt__asset-name { color: var(--nu-ink); }
/* :not(:first-child) e não sibling: a linha de breakdown expandida não pode
   quebrar a cadeia de bordas entre linhas. */
.rkt__row:not(:first-child) .rkt__cell { border-top: 1.5px solid var(--nu-line-2); }

.rkt__cell {
  padding: 13px 16px; text-align: right; white-space: nowrap;
  color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.rkt__cell--pos {
  width: 52px; text-align: left; padding-left: clamp(16px, 2vw, 28px);
  color: var(--nu-gray); font-size: 14.5px; font-weight: 700;
}
.rkt__cell--asset { text-align: left; }
/* a métrica do ranking: o número que a pessoa veio ver */
.rkt__cell--main { color: var(--nu-ink); font-size: 17px; font-weight: 800; letter-spacing: -0.01em; }
.rkt__cell--num:last-child { padding-right: clamp(16px, 2vw, 28px); }
/* a variação no selo de raio 8 */
.rkt__selo {
  display: inline-flex; align-items: center; min-height: 28px; padding: 0 9px; border-radius: var(--nu-r-tag);
  font-size: 14.5px; font-weight: 700; letter-spacing: 0;
}
.rkt__selo--up { background: var(--nu-green-bg); color: var(--nu-green-text); }
.rkt__selo--down { background: var(--nu-red-bg); color: var(--nu-red-text); }
.rkt__selo--flat { background: var(--nu-cream-2); color: var(--nu-gray-3); }

/* ——— breakdown expansível (redentia-score) ——— */
.rkt__toggle {
  background: none; border: 0; padding: 0; cursor: pointer;
  color: var(--nu-blue-text); font-size: 14.5px; font-weight: 700; min-height: 44px;
  font-family: inherit; white-space: nowrap; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1.5px;
}
.rkt__breakdown-cell {
  padding: 16px clamp(16px, 2vw, 28px) 20px;
  background: var(--nu-page); border-top: 1.5px solid var(--nu-line-2);
}
.rkt__breakdown-label {
  display: block; margin-bottom: 12px;
  color: var(--nu-ink); font-size: 13.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .16em;
}
.rkt__breakdown-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.rkt__chip {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-white); box-shadow: var(--nu-shadow-quente);
  border-radius: var(--nu-r-pill); min-height: 36px; padding: 6px 14px;
  color: var(--nu-ink); font-size: 13.5px; font-weight: 700;
  white-space: nowrap; transition: background .2s;
}
.rkt__chip:hover { background: var(--nu-cream-2); }
.rkt__chip-pos { color: var(--nu-blue-text); font-weight: 800; font-variant-numeric: tabular-nums; }
.rkt__breakdown-empty { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }

.rkt__asset { display: flex; align-items: center; gap: 12px; min-width: 0; }
.rkt__asset-id { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; min-width: 0; }
/* o ticker na etiqueta carvão */
.rkt__asset-ticker {
  display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: var(--nu-r-tag);
  background: var(--nu-ink); color: var(--nu-white); font-size: 13.5px; font-weight: 800; letter-spacing: .04em; line-height: 1;
  transition: background .2s ease;
}
.rkt__row:hover .rkt__asset-ticker { background: var(--nu-blue-text); }
.rkt__asset-name {
  color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.2;
  max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color .2s ease;
}

/* ——— celular: o ativo fica preso à esquerda; a métrica do ranking é a primeira
   coluna que aparece e as outras rolam por baixo ——— */
@media (max-width: 760px) {
  .rkt__table { min-width: 0; }
  .rkt__th, .rkt__cell { padding-left: 10px; padding-right: 10px; }
  /* alturas inteiras: a coluna presa é composta à parte, e meia fração de pixel desalinha o fio */
  .rkt__th { height: 48px; padding-top: 0; padding-bottom: 0; line-height: 16px; }
  /* o rótulo da métrica quebra em duas linhas ("VALOR DE / MERCADO"): a coluna fica na largura do número */
  .rkt__th--main { white-space: normal; letter-spacing: .12em; }
  .rkt__cell { height: 72px; padding-top: 0; padding-bottom: 0; }
  .rkt__th--pos, .rkt__cell--pos { width: 34px; min-width: 34px; padding-left: 14px; padding-right: 0; position: sticky; left: 0; z-index: 2; background: var(--nu-white); }
  .rkt__th--asset, .rkt__cell--asset {
    position: sticky; left: 34px; z-index: 2; background: var(--nu-white); padding-left: 8px;
    box-shadow: 8px 0 10px -8px color-mix(in srgb, var(--nu-ink) 14%, transparent);
  }
  .rkt__row:hover .rkt__cell--pos, .rkt__row:hover .rkt__cell--asset { background: var(--nu-page); }
  .rkt__asset { gap: 10px; }
  .rkt__logo { transform: scale(.85); margin: 0 -3px; }
  .rkt__asset-name { max-width: 104px; }
  .rkt__cell--main { font-size: 16px; }
  .rkt__th--num:last-child, .rkt__cell--num:last-child { padding-right: 16px; }
}
@media (prefers-reduced-motion: reduce) { .rkt__row, .rkt__asset-ticker, .rkt__asset-name { transition: none; } }
</style>

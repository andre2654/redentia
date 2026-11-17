<script setup lang="ts">
// Tabela do ranking — colunas fixas (#, Ativo com NuAssetLogo, Cotação) +
// colunas configuráveis por meta.columns (formatters em utils/rankings.ts).
// Linha inteira leva ao /asset/<ticker> (pela janelinha de espiar). tabular-nums em todo número.
// Mobile ≤760: o CONTAINER rola horizontal (a página nunca rola no eixo x).
//
// breakdown (só o redentia-score): coluna extra 'Ver posições'/'Ocultar' que
// expande a linha com os chips de posição (#N) nos 15 rankings que compõem o
// score (SCORE_BREAKDOWN_MAP em utils/rankings.ts) — portado da página
// dedicada da Redentia antiga (redentia-score.vue), inclusive o fallback
// 'Sem detalhes disponíveis para este ativo.'
//
// 2ª rodada da Aportou (11/11/2026): o ticker vai numa etiqueta carvão, a
// variação (colunas com sinal) num selo de raio 8, e a coluna da métrica do
// ranking (`primary`) vem logo depois do ativo, em destaque: é o número que a
// pessoa veio ver. No celular o ativo fica preso à esquerda e as outras colunas
// rolam por baixo dele, então esse número aparece sem arrastar. Os dados, as
// colunas e os links são os de antes; só a ordem das colunas põe a principal na frente.
//
// Robustez (11/11/2026): a pele é a das tabelas de mercado (tabela-mercado.css:
// cabeçalho de 12px em caixa alta que gruda ao rolar, linhas de 56px, a linha
// que acende com a seta no fim). O ticker e a variação são o NuSelo da base, o
// detalhe do score abre com a altura animada e, numa troca de filtro, a lista
// de antes fica esmaecida (`ocupada`) até a nova chegar, sem a página pular.
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
  /** o dado novo está chegando (troca de filtro): a lista de agora fica, esmaecida */
  ocupada?: boolean
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
/** #, ativo, cotação, as colunas, o detalhe (score) e a seta */
const totalDeColunas = computed(() => 4 + defs.value.length + (props.breakdown ? 1 : 0))

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

/** o tom do selo das colunas com sinal (null = número sem selo; sem dado, sem selo) */
function seloDe(key: RankingColumnKey, row: RankingRowApi): 'verde' | 'vermelho' | 'neutro' | null {
  const def = RANKING_COLUMNS[key]
  if (!def.signed) return null
  const v = def.raw(row)
  if (v == null) return null
  // o que arredonda para zero fica no selo neutro
  if (Math.abs(v) < 0.05) return 'neutro'
  return v < 0 ? 'vermelho' : 'verde'
}
</script>

<template>
  <div class="rkt" :class="{ 'rkt--ocupada': ocupada }" :aria-busy="ocupada || undefined">
    <table class="rkt__table">
      <thead>
        <tr>
          <th class="rkt__th rkt__th--pos" scope="col">#</th>
          <th class="rkt__th rkt__th--asset" scope="col">Ativo</th>
          <th v-if="principal" class="rkt__th rkt__th--num rkt__th--main" scope="col">{{ principal.label }}</th>
          <th class="rkt__th rkt__th--num" scope="col">Cotação</th>
          <th v-for="c in demais" :key="c.key" class="rkt__th rkt__th--num" scope="col">{{ c.label }}</th>
          <th v-if="breakdown" class="rkt__th rkt__th--num" scope="col">Posições</th>
          <td class="rkt__th rkt__th--ir" aria-hidden="true" />
        </tr>
      </thead>
      <tbody>
        <template v-for="(row, i) in rows" :key="rankingTicker(row) || i">
          <tr
            v-contexto-chat="{ id: `ranking-linha:${sobre}:${rankingTicker(row)}`, tipo: 'ranking', rotulo: rotuloCurto(`${i + 1}º ${rankingTicker(row)}${sobre ? ` · ${sobre}` : ''}`) }"
            class="rkt__row" :class="{ 'rkt__row--aberta': breakdown && expandedTicker === rankingTicker(row) }"
            @click="clicarLinha($event, rankingTicker(row))"
          >
            <td class="rkt__cell rkt__cell--pos">{{ i + 1 }}</td>
            <td class="rkt__cell rkt__cell--asset">
              <NuxtLink :to="`/asset/${rankingTicker(row)}`" class="rkt__asset" @click.stop>
                <NuAssetLogo
                  class="rkt__logo"
                  :ticker="rankingTicker(row)" :letter="rankingTicker(row).charAt(0) || '?'"
                  tile-bg="var(--nu-cream-2)" tile-fg="var(--nu-ink)"
                  :size="32" :radius="10"
                />
                <span class="rkt__asset-id">
                  <NuSelo tom="carvao" tamanho="p">{{ rankingTicker(row) }}</NuSelo>
                  <span v-if="rankingName(row)" class="rkt__asset-name">{{ rankingName(row) }}</span>
                </span>
              </NuxtLink>
            </td>
            <td v-if="principal" class="rkt__cell rkt__cell--num rkt__cell--main">
              <NuSelo v-if="seloDe(principal.key, row)" :tom="seloDe(principal.key, row)!">{{ principal.def.format(row) }}</NuSelo>
              <template v-else>{{ principal.def.format(row) }}</template>
            </td>
            <td class="rkt__cell rkt__cell--num">{{ rankingPrice(row) }}</td>
            <td v-for="c in demais" :key="c.key" class="rkt__cell rkt__cell--num">
              <NuSelo v-if="seloDe(c.key, row)" :tom="seloDe(c.key, row)!">{{ c.def.format(row) }}</NuSelo>
              <template v-else>{{ c.def.format(row) }}</template>
            </td>
            <td v-if="breakdown" class="rkt__cell rkt__cell--num">
              <button
                type="button" class="rkt__abrir"
                :aria-expanded="expandedTicker === rankingTicker(row)"
                @click.stop="toggleBreakdown(rankingTicker(row))"
              >
                <span>{{ expandedTicker === rankingTicker(row) ? 'Ocultar' : 'Ver posições' }}</span>
                <svg class="rkt__abrir-v" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 9.5 12 15.5 18 9.5" /></svg>
              </button>
            </td>
            <td class="rkt__cell rkt__cell--ir" aria-hidden="true">
              <svg class="rkt__ir" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg>
            </td>
          </tr>
          <!-- o detalhe do score: a altura abre animada (o "o que muda de lugar" da robustez) -->
          <Transition name="rkt-dobra">
            <tr v-if="breakdown && expandedTicker === rankingTicker(row)" class="rkt__breakdown-row">
              <td class="rkt__breakdown-cell" :colspan="totalDeColunas">
                <div class="rkt__dobra">
                  <div class="rkt__dobra-in">
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
                  </div>
                </div>
              </td>
            </tr>
          </Transition>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped src="./tabela-mercado.css"></style>
<style scoped>
/* ——— o detalhe do score (redentia-score) ——— */
/* o botão da coluna: carvão e calmo (são 50 iguais, um por linha), com a
   divisa que gira ao abrir; sob o ponteiro, cobalto e sublinhado. O alvo tem
   44px sem empurrar a linha: a margem negativa devolve o que o alvo cresce */
.rkt__abrir {
  display: inline-flex; align-items: center; gap: 6px; min-height: 44px; margin: -10px 0; padding: 0; border: 0; background: none; cursor: pointer;
  color: var(--nu-ink); font: inherit; font-size: 14px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  transition: color var(--nu-dur-rapida) var(--nu-ease-cor), opacity var(--nu-dur-rapida) var(--nu-ease-cor);
}
.rkt__abrir span {
  text-decoration-line: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: transparent;
  transition: text-decoration-color var(--nu-dur-media) var(--nu-ease-cor);
}
.rkt__abrir:hover, .rkt__abrir[aria-expanded="true"] { color: var(--nu-blue-text); }
.rkt__abrir:hover span { text-decoration-color: currentColor; }
.rkt__abrir:active { opacity: .72; }
.rkt__abrir-v { flex: none; width: 16px; height: 16px; transition: transform var(--nu-dur-lenta) var(--nu-ease-troca); }
.rkt__abrir[aria-expanded="true"] .rkt__abrir-v { transform: rotate(180deg); }
/* a linha aberta fica acesa, emendada no detalhe dela */
.rkt__row--aberta { background-color: var(--rkt-acende); }

.rkt__breakdown-cell { padding: 0; background: var(--rkt-acende); border-top: 1px solid var(--nu-line-2); }
/* a altura anima pela grade (0fr → 1fr): o conteúdo está inteiro, só a janela cresce */
.rkt__dobra { display: grid; grid-template-rows: 1fr; }
.rkt__dobra-in { min-height: 0; overflow: hidden; }
.rkt__dobra-in > * { margin-left: var(--rkt-borda); margin-right: var(--rkt-borda); }
.rkt__dobra-in > :first-child { margin-top: 16px; }
.rkt__dobra-in > :last-child { margin-bottom: 20px; }
.rkt-dobra-enter-active { animation: nu-surgir var(--nu-dur-lenta) var(--nu-ease-troca); }
.rkt-dobra-enter-active .rkt__dobra { animation: rkt-abre var(--nu-dur-lenta) var(--nu-ease-troca); }
.rkt-dobra-leave-active { animation: nu-surgir var(--nu-dur-media) var(--nu-ease-troca) reverse; }
.rkt-dobra-leave-active .rkt__dobra { animation: rkt-abre var(--nu-dur-media) var(--nu-ease-troca) reverse; }
@keyframes rkt-abre { from { grid-template-rows: 0fr; } to { grid-template-rows: 1fr; } }

.rkt__breakdown-label {
  display: block; margin-bottom: 12px;
  color: var(--nu-gray); font-size: 12px; font-weight: var(--nu-w-medio); line-height: 16px;
  text-transform: uppercase; letter-spacing: var(--nu-ls-caixa);
}
.rkt__breakdown-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.rkt__chip {
  display: inline-flex; align-items: center; gap: 8px; min-height: 36px; padding: 0 12px;
  background: var(--nu-white); box-shadow: var(--nu-shadow-quente); border-radius: var(--nu-r-tag);
  color: var(--nu-ink); font-size: 13.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
  white-space: nowrap; transition: background-color var(--nu-dur-rapida) var(--nu-ease-cor);
}
.rkt__chip:hover { background: var(--nu-cream-2); }
.rkt__chip:active { background: var(--nu-line-2); }
.rkt__chip-pos { color: var(--nu-gray); font-weight: var(--nu-w-texto); font-variant-numeric: tabular-nums; }
.rkt__breakdown-empty { color: var(--nu-gray); font-size: 14px; font-weight: var(--nu-w-texto); }

/* celular: a tabela rola de lado e o botão do detalhe mora na última coluna.
   O detalhe aberto gruda na borda esquerda do cartão, na largura que se vê
   (100cqi do cartão): não é preciso rolar de volta para ler as posições */
@media (max-width: 760px) {
  .rkt { container-type: inline-size; }
  .rkt__dobra-in { position: sticky; left: 0; width: 100cqi; }
  .rkt__row--aberta .rkt__cell--pos, .rkt__row--aberta .rkt__cell--asset { background-color: var(--rkt-acende); }
}
</style>

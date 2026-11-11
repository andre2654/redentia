<script setup lang="ts">
// Resumo dos últimos 12 meses (/dividendos/[ticker]): banda branca 2 colunas
// na anatomia da seção de dividendos do /asset (AcaoDividends), esquerda com
// h2 + subtítulo + NuStatList light, direita com NuDividendBars (reuso).
// Aqui NÃO tem pill de posição (landing 100% pública) e o CTA aponta pra
// calculadora de dividend yield com deep-link do ticker.
// Robustez (11/11/2026): as duas colunas entram ao chegar perto da tela
// (v-revelar), no lugar do nu-fade que rodava no mount, fora da vista; o
// respiro no ritmo de 8px e o título no tracking de exibição.
import type { AcaoDividendBar, AcaoStatRow } from '~/types/acao'

defineProps<{
  ticker: string
  isFii: boolean
  heading: [string, string]
  subtitle: string
  rows: AcaoStatRow[]
  bars: AcaoDividendBar[]
  /** rodapé das barras (renda por ano, ou amortização quando o papel só devolveu capital) */
  barsNote?: string
  /** fonte e data dos números da coluna */
  fonte?: string
}>()
// o sujeito do chip do chat (proverSobreDoContexto na página)
const sobre = useSobreDoContexto()
</script>

<template>
  <section v-contexto-chat="{ id: `dividendos-resumo:${sobre}`, tipo: 'proventos', rotulo: rotuloComSobre('Proventos', sobre) }" class="dvr">
    <div class="dvr__cols">
      <div v-revelar class="dvr__left">
        <NuEyebrow como="p">{{ isFii ? 'Rendimentos' : 'Proventos' }}</NuEyebrow>
        <h2 class="dvr__title">{{ heading[0] }}<br>{{ heading[1] }}</h2>
        <div class="dvr__sub">{{ subtitle }}</div>
        <div class="dvr__stats">
          <NuStatList :rows="rows" />
          <p v-if="fonte" class="dvr__fonte">{{ fonte }}</p>
        </div>
        <div class="dvr__cta-row">
          <NuBotaoSeta :to="`/calculadora/dividend-yield?ticker=${ticker}`" variante="carvao" tamanho="m">Calcular o DY de {{ ticker }}</NuBotaoSeta>
        </div>
      </div>
      <div v-revelar class="dvr__right">
        <NuDividendBars
          v-if="bars.length"
          :bars="bars"
          :footnote="barsNote ?? `${isFii ? 'Rendimentos' : 'Dividendos + JCP'} por ${isFii ? 'cota' : 'ação'}, por ano · ${bars[bars.length - 1]?.year ?? ''} considera os últimos 12 meses`"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.dvr {
  /* Aportou: sem faixa branca de ponta a ponta; a banda é o creme da página */
  background: var(--nu-page);
  padding: clamp(72px, 8vw, 128px) var(--nu-coluna);
}
.dvr__cols { display: flex; gap: clamp(32px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.dvr__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.dvr__title {
  margin: 16px 0 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1.02;
}
.dvr__sub { color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.5; margin-top: 20px; }
.dvr__stats { margin-top: 32px; }
.dvr__fonte {
  margin: 16px 0 0; color: var(--nu-gray); font-size: 13px;
  font-weight: var(--nu-w-texto); line-height: 1.5; max-width: 46ch;
}
.dvr__cta-row { margin-top: 32px; }
/* as barras no tom do /asset: creme de fio as passadas, cobalto a corrente */
.dvr__right { flex: 1.6 1 460px; min-width: min(320px, 100%); --nu-bar-inactive: var(--nu-line); }
.dvr__right :deep(.ndb__bar) { max-width: 132px; border-radius: 12px 12px 4px 4px; }
</style>

<template>
  <NuxtLayout name="default" title="Maiores Baixas do Mês">
    <RankingUiShell
      back-to="/ranking"
      back-label="Todos os rankings"
      :status-meta="statusMeta"
    >
      <template #hero>
        <RankingUiHero eyebrow="Ranking · Correções" :chips="heroChips">
          <template #title>
            Maiores Baixas do Mês: Ações que Mais <em>Caíram</em> na Bolsa B3 2026
          </template>
          <template #lead>
            As 50 ações e FIIs que mais caíram nos últimos 30 dias na B3, ordenadas por queda percentual. Lista pode revelar oportunidades de compra (ações baratas, value plays) OU armadilhas de valor (value traps). Inclui blue chips em correção (VALE3, BBDC4, ITUB4, ABEV3), FIIs em desconto (HGLG11, MXRF11, KNIP11) e ativos com problemas específicos. Atualizado diariamente após pregão.
          </template>
        </RankingUiHero>
      </template>

      <template v-if="leader" #leader>
        <RankingUiLeader
          rank-label="#1 da queda"
          trophy-icon="i-lucide-trending-down"
          :ticker="leader.stock || leader.ticker || ''"
          :name="leader.name"
          :sector="leader.sector"
          :value="Number(leader.change_percent ?? 0)"
          value-label="Queda 30 dias"
          :price="leader.market_price ?? leader.close"
        />
      </template>

      <section class="baixas-content">
        <!-- Table toolbar (eyebrow + filter) -->
        <header class="baixas-table-toolbar">
          <div class="baixas-table-toolbar-meta">
            <p class="baixas-table-toolbar-eyebrow">Lista completa</p>
            <p class="baixas-table-toolbar-count">
              {{ rows?.length || 0 }} ativos em correção
            </p>
          </div>
          <AtomsSegmented
            v-model="activeType"
            :options="tabs"
            aria-label="Filtrar tipo de ativo"
          />
        </header>

        <div v-if="pending" class="flex items-center justify-center py-16">
          <UIcon name="i-lucide-loader" class="size-6 motion-safe:animate-spin" />
        </div>
        <MoleculesRankingTable
          v-else
          :rows="rows"
          :columns="['change', 'marketCap']"
          change-label="Variação 30d"
        />

        <!-- Answer-first paragraph (abaixo da tabela, centralizado, fonte normal) -->
        <p class="baixas-answer-first">
          As ações que mais caíram no mês podem representar 2 cenários: oportunidade (mercado exagerou na queda, fundamentos intactos = compra com desconto) ou armadilha de valor (queda reflete deterioração real dos fundamentos = continuará caindo). Este ranking lista as 50 maiores quedas dos últimos 30 dias. Sempre investigue O PORQUÊ da queda antes de comprar.
        </p>

        <article
          class="mt-8 border-t pt-8"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <h2>Oportunidade ou armadilha?</h2>
          <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
            Ativos em baixa podem representar entradas a preços descontados,
            mas também podem estar refletindo deterioração de fundamentos. Antes
            de qualquer decisão, analise o motivo da queda: é setorial,
            macroeconômico ou específico da empresa?
          </p>
          <h3>Como usar este ranking</h3>
          <ul class="space-y-2" :style="{ color: 'var(--brand-text-muted)' }">
            <li>Identifique setores com quedas generalizadas (pressão macro)</li>
            <li>Pesquise notícias recentes sobre cada ativo</li>
            <li>Compare a queda com pares do mesmo setor</li>
            <li>Verifique se a tese de longo prazo continua intacta</li>
          </ul>
        </article>

        <!-- Setores Mais Resilientes -->
        <article
          class="border-t pt-8"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <h2>Setores Mais Resilientes em Momentos de Stress</h2>
          <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
            Em ciclos de queda do Ibovespa, nem todos os setores caem na mesma
            intensidade. Setores defensivos (consumo básico, energia regulada,
            saneamento) tendem a cair menos por terem demanda inelástica e
            fluxo de caixa mais previsível. Já setores cíclicos (commodities,
            varejo discricionário, tech) sofrem mais em recessão. A tabela
            abaixo mostra padrões clássicos de comportamento setorial em
            quedas na B3.
          </p>
          <div class="mt-4 overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr
                  class="border-b text-left"
                  :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-text)' }"
                >
                  <th class="py-3 pr-4 font-medium">Setor</th>
                  <th class="py-3 pr-4 font-medium">Comportamento em quedas</th>
                  <th class="py-3 font-medium">Tickers exemplo</th>
                </tr>
              </thead>
              <tbody :style="{ color: 'var(--brand-text-muted)' }">
                <tr class="border-b" :style="{ borderColor: 'var(--brand-border)' }">
                  <td class="py-3 pr-4 font-medium" :style="{ color: 'var(--brand-text)' }">Defensivas</td>
                  <td class="py-3 pr-4">Caem menos (demanda inelástica)</td>
                  <td class="py-3">ABEV3, NTCO3, EGIE3</td>
                </tr>
                <tr class="border-b" :style="{ borderColor: 'var(--brand-border)' }">
                  <td class="py-3 pr-4 font-medium" :style="{ color: 'var(--brand-text)' }">Saneamento</td>
                  <td class="py-3 pr-4">Resiliente (regulado, demanda estável)</td>
                  <td class="py-3">SBSP3</td>
                </tr>
                <tr class="border-b" :style="{ borderColor: 'var(--brand-border)' }">
                  <td class="py-3 pr-4 font-medium" :style="{ color: 'var(--brand-text)' }">Bancos</td>
                  <td class="py-3 pr-4">Caem com aumento de inadimplência</td>
                  <td class="py-3">ITUB4, BBDC4, BBAS3</td>
                </tr>
                <tr class="border-b" :style="{ borderColor: 'var(--brand-border)' }">
                  <td class="py-3 pr-4 font-medium" :style="{ color: 'var(--brand-text)' }">Commodities</td>
                  <td class="py-3 pr-4">Voláteis (sensíveis a ciclo global)</td>
                  <td class="py-3">VALE3, PETR4</td>
                </tr>
                <tr class="border-b" :style="{ borderColor: 'var(--brand-border)' }">
                  <td class="py-3 pr-4 font-medium" :style="{ color: 'var(--brand-text)' }">Varejo discricionário</td>
                  <td class="py-3 pr-4">Caem mais em recessão (consumo cai)</td>
                  <td class="py-3">MGLU3, AMER3</td>
                </tr>
                <tr>
                  <td class="py-3 pr-4 font-medium" :style="{ color: 'var(--brand-text)' }">Tech</td>
                  <td class="py-3 pr-4">Volátil, sensível a juros (duration alta)</td>
                  <td class="py-3">TOTS3, LWSA3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <!-- Oportunidade vs Armadilha -->
        <article
          class="border-t pt-8"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <h2>Oportunidades de Compra vs Armadilhas de Valor (Value Traps)</h2>
          <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
            Distinguir uma oportunidade real de uma armadilha de valor (value
            trap) é a habilidade mais importante do investidor de longo prazo.
            Os dois cenários parecem iguais na superfície (ação caiu, P/L
            baixo), mas o desfecho é diametralmente oposto: oportunidade vira
            retorno, armadilha vira prejuízo permanente.
          </p>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <div
              class="rounded-2xl border p-5"
              :style="{
                borderColor: 'var(--brand-border)',
                backgroundColor: 'color-mix(in srgb, var(--brand-positive) 6%, transparent)',
              }"
            >
              <h3 class="mb-2 text-base font-medium" :style="{ color: 'var(--brand-text)' }">
                Oportunidade
              </h3>
              <p class="text-sm leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
                Empresa boa, queda exagerada por evento de curto prazo (notícia
                ruim, crise setorial passageira, ciclo macro adverso).
                <strong :style="{ color: 'var(--brand-text)' }">Sinais:</strong>
                P/L baixo versus histórico, fundamentos intactos (receita
                estável ou crescente, margens preservadas), gestão competente,
                vantagem competitiva preservada.
                <strong :style="{ color: 'var(--brand-text)' }">Estratégia:</strong>
                comprar gradualmente em níveis técnicos (preço médio), com horizonte de 2-5 anos.
              </p>
            </div>
            <div
              class="rounded-2xl border p-5"
              :style="{
                borderColor: 'var(--brand-border)',
                backgroundColor: 'color-mix(in srgb, var(--brand-negative) 6%, transparent)',
              }"
            >
              <h3 class="mb-2 text-base font-medium" :style="{ color: 'var(--brand-text)' }">
                Value Trap (Armadilha de Valor)
              </h3>
              <p class="text-sm leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
                Queda reflete deterioração real e estrutural (perda de market
                share, problema regulatório, mudança de hábito do consumidor,
                disrupção tecnológica).
                <strong :style="{ color: 'var(--brand-text)' }">Sinais:</strong>
                receita caindo de forma consistente, margem comprimida, dívida
                crescente, payout caindo, gestão sem credibilidade.
                <strong :style="{ color: 'var(--brand-text)' }">Estratégia:</strong>
                evitar mesmo que o P/L pareça atrativo. P/L baixo é sintoma, não solução.
              </p>
            </div>
          </div>
        </article>

        <!-- Stop Loss, Suporte e Resistência -->
        <article
          class="border-t pt-8"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <h2>Stop Loss, Suporte e Resistência: Análise Técnica em Quedas</h2>
          <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
            Análise técnica não é sinal de compra ou venda isolado, mas
            ferramenta complementar de gestão de risco. Em ações caindo, ela
            ajuda a identificar zonas de entrada com risco controlado e a
            definir pontos de saída em caso de erro.
          </p>
          <ul class="mt-4 space-y-3" :style="{ color: 'var(--brand-text-muted)' }">
            <li>
              <strong :style="{ color: 'var(--brand-text)' }">Suporte:</strong>
              preço onde a ação encontra demanda (compradores aparecem). Em
              tendências de queda, o rompimento de um suporte importante
              costuma acelerar a queda.
            </li>
            <li>
              <strong :style="{ color: 'var(--brand-text)' }">Resistência:</strong>
              preço onde a ação encontra oferta (vendedores aparecem). Em
              recuperações, a quebra de uma resistência confirma reversão de
              tendência.
            </li>
            <li>
              <strong :style="{ color: 'var(--brand-text)' }">Stop loss:</strong>
              ordem automática de venda para limitar perdas. Geralmente posicionada
              5-10% abaixo do preço de entrada, ajustada conforme volatilidade do
              ativo (ATR).
            </li>
          </ul>
          <p class="mt-4 leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
            Em ações em queda, identificar suporte ajuda a achar entrada de
            baixo risco (perto do suporte, com stop logo abaixo).
          </p>
        </article>

        <!-- Comparativo com Ibovespa -->
        <article
          class="border-t pt-8"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <h2>Comparativo com Ibovespa</h2>
          <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
            Comparar a queda de uma ação com o movimento do Ibovespa permite
            distinguir queda específica do ativo de queda macro do mercado todo.
            Quando o Ibov cai 5% e uma ação cai 15%, há problema específico (não
            é apenas beta de mercado), pode ser resultado fraco, mudança
            regulatória negativa, perda de cliente importante. Quando o Ibov
            cai 5% e a ação cai 6%, a ação está apenas acompanhando o índice,
            provavelmente sem catalisador próprio.
          </p>
          <p class="mt-4 leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
            Use o ranking para distinguir queda específica de queda macro. Se
            múltiplas ações do mesmo setor caem juntas, é setorial. Se apenas
            uma cai isoladamente, há catalisador específico que merece
            investigação antes de qualquer decisão.
          </p>
        </article>

        <!-- Glossário Rápido -->
        <article
          class="border-t pt-8"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <h2>Glossário Rápido</h2>
          <dl class="mt-4 space-y-3" :style="{ color: 'var(--brand-text-muted)' }">
            <div>
              <dt class="font-medium" :style="{ color: 'var(--brand-text)' }">Value Trap (armadilha de valor)</dt>
              <dd>Ação que parece barata pelo múltiplo (P/L baixo), mas continua caindo porque os fundamentos estão se deteriorando.</dd>
            </div>
            <div>
              <dt class="font-medium" :style="{ color: 'var(--brand-text)' }">Stop Loss</dt>
              <dd>Ordem automática de venda para limitar perdas, geralmente posicionada 5-10% abaixo do preço de entrada.</dd>
            </div>
            <div>
              <dt class="font-medium" :style="{ color: 'var(--brand-text)' }">Suporte / Resistência</dt>
              <dd>Suporte é zona onde aparecem compradores (preço para de cair); resistência é onde aparecem vendedores (preço para de subir).</dd>
            </div>
            <div>
              <dt class="font-medium" :style="{ color: 'var(--brand-text)' }">Correção de mercado</dt>
              <dd>Queda entre 10% e 20% no índice principal (Ibovespa). Acontece historicamente 1-2 vezes por ano e é considerada parte normal do ciclo.</dd>
            </div>
            <div>
              <dt class="font-medium" :style="{ color: 'var(--brand-text)' }">Bear Market</dt>
              <dd>Queda acima de 20% no índice principal a partir do topo recente, caracterizando ciclo de baixa prolongado (meses ou anos).</dd>
            </div>
            <div>
              <dt class="font-medium" :style="{ color: 'var(--brand-text)' }">Drawdown</dt>
              <dd>Diferença entre o pico anterior e o vale atual de um ativo ou carteira. Mede a maior queda já enfrentada.</dd>
            </div>
            <div>
              <dt class="font-medium" :style="{ color: 'var(--brand-text)' }">Catalisador negativo</dt>
              <dd>Evento específico que derruba o preço: resultado abaixo do esperado, processo judicial, perda de contrato importante, mudança regulatória.</dd>
            </div>
          </dl>
        </article>

        <!-- FAQ -->
        <article
          class="border-t pt-8"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <h2>Perguntas Frequentes</h2>
          <div class="mt-4 space-y-3">
            <details
              v-for="(item, idx) in faqItems"
              :key="idx"
              class="group rounded-xl border p-4"
              :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }"
            >
              <summary
                class="cursor-pointer list-none text-base font-medium"
                :style="{ color: 'var(--brand-text)' }"
              >
                {{ item.question }}
              </summary>
              <p class="mt-3 text-sm leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
                {{ item.answer }}
              </p>
            </details>
          </div>
        </article>

        <!-- Outros Rankings -->
        <article
          class="border-t pt-8"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <h2>Outros Rankings</h2>
          <div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <NuxtLink
              v-for="link in crossLinks"
              :key="link.path"
              :to="link.path"
              class="group rounded-2xl border p-5 transition hover:opacity-80"
              :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="link.icon"
                  class="size-4"
                  :style="{ color: 'var(--brand-primary)' }"
                />
                <p class="text-sm font-medium" :style="{ color: 'var(--brand-text)' }">
                  {{ link.title }}
                </p>
              </div>
              <p class="mt-2 text-xs" :style="{ color: 'var(--brand-text-muted)' }">
                {{ link.description }}
              </p>
            </NuxtLink>
          </div>
        </article>
      </section>
    </RankingUiShell>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { RankingHeroChip } from '~/components/ranking-ui/Hero.vue'

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const service = useAssetsService()

const faqItems = [
  {
    question: 'O que é uma armadilha de valor (value trap)?',
    answer:
      'É uma ação que parece barata pelo múltiplo (P/L baixo, dividend yield alto), mas continua caindo porque os fundamentos estão se deteriorando estruturalmente. O investidor entra atraído pelo "preço barato", mas o preço continua caindo porque a empresa está perdendo valor de verdade. Comum em setores em disrupção ou empresas com problemas de gestão.',
  },
  {
    question: 'Como diferenciar oportunidade de armadilha de valor?',
    answer:
      'Oportunidade tem fundamentos intactos (receita estável ou crescente, margens preservadas, gestão competente) e queda causada por evento de curto prazo (notícia ruim, ciclo macro). Armadilha tem deterioração real (receita caindo de forma consistente, margens comprimidas, perda de market share, dívida crescente). Olhe os 4-8 últimos trimestres antes de decidir.',
  },
  {
    question: 'Devo comprar a ação que mais caiu?',
    answer:
      'Só após investigar profundamente o porquê da queda. Se for evento curto e fundamentos intactos, sim, é oportunidade. Se for deterioração estrutural, não, é armadilha. Comprar simplesmente porque caiu (estratégia "catch a falling knife") é receita de prejuízo. Use o ranking como filtro inicial, não como sinal de compra.',
  },
  {
    question: 'O que é stop loss e como definir?',
    answer:
      'Stop loss é uma ordem automática que vende a ação se ela cair além de um limite predefinido (ex: 10% abaixo do preço de compra). Limita o prejuízo em caso de erro de tese ou movimento adverso. O nível ideal depende da volatilidade do ativo (use ATR), do horizonte de investimento e do tamanho da posição na carteira.',
  },
  {
    question: 'Quando o mercado entra em correção?',
    answer:
      'Queda entre 10% e 20% no Ibovespa caracteriza correção de mercado. Acima de 20% a partir do topo recente, é classificado como bear market (mercado urso). Historicamente, correções de 10%+ acontecem 1-2 vezes por ano e fazem parte do ciclo normal. Bear markets acontecem a cada 5-7 anos em média no Brasil.',
  },
]

const crossLinks = [
  {
    path: '/ranking/maiores-altas-mes',
    title: 'Maiores Altas do Mês',
    description: 'As 50 ações e FIIs com maior alta nos últimos 30 dias.',
    icon: 'i-lucide-trending-up',
  },
  {
    path: '/ranking/maiores-dividend-yield',
    title: 'Maiores Dividend Yields',
    description: 'Ações e FIIs com maior DY dos últimos 12 meses.',
    icon: 'i-lucide-coins',
  },
  {
    path: '/dividendos/calendario',
    title: 'Calendário de Dividendos',
    description: 'Próximos pagamentos de dividendos da B3.',
    icon: 'i-lucide-calendar',
  },
  {
    path: '/ranking',
    title: 'Todos os Rankings',
    description: 'Lista completa de rankings da Redentia.',
    icon: 'i-lucide-list',
  },
]

usePageSeo({
  title: 'Maiores Baixas do Mês na Bolsa Brasileira | Redentia',
  description:
    'Ranking das 50 ações e FIIs que mais caíram nos últimos 30 dias na B3. Oportunidades de compra ou value traps? Análise + comparativo Ibov.',
  path: '/ranking/maiores-baixas-mes',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Rankings', path: '/ranking' },
    { name: 'Maiores Baixas do Mês', path: '/ranking/maiores-baixas-mes' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Maiores Baixas do Mês na Bolsa Brasileira',
      description: 'Ações e FIIs que mais caíram nos últimos 30 dias na B3.',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: 50,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ],
})

// AtomsSegmented exige value string|number, entao usamos 'all' como
// sentinel para "sem filtro" e convertemos pra null antes de chamar o
// service (que espera null pra retornar todos os tipos).
type TickerFilter = 'all' | 'STOCK' | 'REIT' | 'ETF' | 'BDR'

const tabs: Array<{ label: string; value: TickerFilter }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Ações', value: 'STOCK' },
  { label: 'FIIs', value: 'REIT' },
  { label: 'ETFs', value: 'ETF' },
]

const activeType = ref<TickerFilter>('all')

const { data: rows, pending } = await useAsyncData(
  'ranking-baixas-mes',
  () => service.getMonthlyChange('bottom', activeType.value === 'all' ? null : activeType.value, 50),
  { watch: [activeType], default: () => [] }
)

// V5 bindings — leader + chips + status meta
const leader = computed(() => {
  const list = rows.value as any[] | null
  return list && list.length ? list[0] : null
})

const heroChips: RankingHeroChip[] = [
  { label: 'Atualizado diário' },
  { label: 'Variação 30 dias' },
  { label: 'Dados oficiais B3' },
  { label: 'Oportunidade ou armadilha' },
]

const statusMeta = computed(() => {
  const count = rows.value?.length || 50
  return `Top ${count} · Variação 30d · B3`
})
</script>

<style scoped>
.baixas-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 48px 24px 64px;
  max-width: 1200px;
  margin: 0 auto;
  border-top: 1px solid var(--border-subtle);
}
@media (min-width: 768px) {
  .baixas-content { padding: 64px 32px 96px; }
}
@media (min-width: 1024px) {
  .baixas-content { padding: 80px 56px 120px; }
}

.baixas-table-toolbar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
}
@media (min-width: 640px) {
  .baixas-table-toolbar {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    gap: 24px;
  }
}
.baixas-table-toolbar-meta { display: flex; flex-direction: column; gap: 4px; }
.baixas-table-toolbar-eyebrow {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-primary);
  margin: 0;
}
.baixas-table-toolbar-count {
  font-size: 15px;
  font-weight: 400;
  color: var(--text-heading);
  margin: 0;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

.baixas-answer-first {
  font-size: 15px;
  line-height: 1.7;
  color: var(--brand-text-muted);
  text-align: center;
  max-width: 68ch;
  margin: 8px auto 0;
}
</style>

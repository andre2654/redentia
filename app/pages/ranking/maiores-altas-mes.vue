<template>
  <NuxtLayout name="default" title="Maiores Altas do Mês">
    <RankingUiShell
      back-to="/ranking"
      back-label="Todos os rankings"
      :status-meta="statusMeta"
    >
      <template #hero>
        <RankingUiHero eyebrow="Ranking · Momentum" :chips="heroChips">
          <template #title>
            Maiores Altas do Mês: Ações que Mais <em>Subiram</em> na Bolsa B3 2026
          </template>
          <template #lead>
            As 50 ações e FIIs que mais subiram nos últimos 30 dias na B3 (Bolsa, Brasil, Balcão), com performance comparada ao Ibovespa e desempenho setorial. Top gainers da semana e do mês incluem ações de bancos, FIIs de logística e papel, blue chips brasileiras como VALE3, ITUB4, ABEV3, B3SA3 e fundos imobiliários como HGLG11, XPML11, KNIP11. Atualizado diariamente após pregão.
          </template>
        </RankingUiHero>
      </template>

      <template v-if="leader" #leader>
        <RankingUiLeader
          rank-label="#1 do mês"
          trophy-icon="i-lucide-trending-up"
          :ticker="leader.stock || leader.ticker || ''"
          :name="leader.name"
          :sector="leader.sector"
          :value="Number(leader.change_percent ?? 0)"
          value-label="Alta 30 dias"
          :price="leader.market_price ?? leader.close"
        />
      </template>

      <section class="altas-content">
        <!-- Table toolbar (eyebrow + filter) -->
        <header class="altas-table-toolbar">
          <div class="altas-table-toolbar-meta">
            <p class="altas-table-toolbar-eyebrow">Lista completa</p>
            <p class="altas-table-toolbar-count">
              {{ rows?.length || 0 }} top gainers do mês
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
        <p class="altas-answer-first">
          As ações que mais subiram no mês geralmente refletem 3 fatores: bons resultados trimestrais, mudanças setoriais (commodities, juros, política) ou momentum técnico (entrada de fluxo institucional). Este ranking lista as 50 ações e FIIs com maior valorização nos últimos 30 dias na B3. Importante: alta recente NÃO garante alta futura, exige análise dos fundamentos antes de comprar.
        </p>

        <article
          class="mt-8 border-t pt-8"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <h2>Como o ranking é calculado?</h2>
          <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
            Comparamos o preço de fechamento atual com o preço de fechamento de
            aproximadamente 30 dias corridos atrás (respeitando dias úteis da
            B3). A variação percentual é então ordenada do maior para o menor
            ganho.
          </p>
          <h3>Por que acompanhar?</h3>
          <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
            Rankings de altas ajudam a identificar momentum, setores aquecidos e
            ativos em tendência. Combinado com análise fundamentalista, serve
            como filtro inicial para novas teses de investimento ou
            monitoramento de posições existentes.
          </p>
        </article>

        <!-- Setores Mais Valorizados -->
        <article
          class="border-t pt-8"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <h2>Setores Mais Valorizados nos Últimos 30 Dias</h2>
          <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
            Quando uma ação aparece entre as maiores altas, raramente é evento
            isolado. Em geral, o setor inteiro está sendo reavaliado pelo mercado
            por algum gatilho macro (juros, câmbio, commodities) ou setorial
            (regulação, demanda, ciclo). A tabela abaixo mostra padrões clássicos
            de comportamento setorial em ciclos de alta na B3.
          </p>
          <div class="mt-4 overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr
                  class="border-b text-left"
                  :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-text)' }"
                >
                  <th class="py-3 pr-4 font-medium">Setor</th>
                  <th class="py-3 pr-4 font-medium">Comportamento típico em alta</th>
                  <th class="py-3 font-medium">Tickers exemplo</th>
                </tr>
              </thead>
              <tbody :style="{ color: 'var(--brand-text-muted)' }">
                <tr class="border-b" :style="{ borderColor: 'var(--brand-border)' }">
                  <td class="py-3 pr-4 font-medium" :style="{ color: 'var(--brand-text)' }">Commodities</td>
                  <td class="py-3 pr-4">Alta com ciclo de commodities (mineração, óleo)</td>
                  <td class="py-3">VALE3, PETR4</td>
                </tr>
                <tr class="border-b" :style="{ borderColor: 'var(--brand-border)' }">
                  <td class="py-3 pr-4 font-medium" :style="{ color: 'var(--brand-text)' }">Bancos</td>
                  <td class="py-3 pr-4">Alta com queda de inadimplência ou Selic estável</td>
                  <td class="py-3">ITUB4, BBDC4, BBAS3, B3SA3</td>
                </tr>
                <tr class="border-b" :style="{ borderColor: 'var(--brand-border)' }">
                  <td class="py-3 pr-4 font-medium" :style="{ color: 'var(--brand-text)' }">FIIs de tijolo</td>
                  <td class="py-3 pr-4">Alta com queda de juros longos (NTN-B)</td>
                  <td class="py-3">HGLG11, XPML11, VISC11</td>
                </tr>
                <tr class="border-b" :style="{ borderColor: 'var(--brand-border)' }">
                  <td class="py-3 pr-4 font-medium" :style="{ color: 'var(--brand-text)' }">FIIs de papel</td>
                  <td class="py-3 pr-4">Alta com Selic estável ou em queda controlada</td>
                  <td class="py-3">KNIP11, MXRF11, KNCR11</td>
                </tr>
                <tr>
                  <td class="py-3 pr-4 font-medium" :style="{ color: 'var(--brand-text)' }">Defensivas</td>
                  <td class="py-3 pr-4">Alta em períodos de stress macro (rotação de risco)</td>
                  <td class="py-3">ABEV3, EGIE3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <!-- Comparativo com Ibovespa -->
        <article
          class="border-t pt-8"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <h2>Comparativo com Ibovespa</h2>
          <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
            O Ibovespa (Ibov) é o índice de referência da bolsa brasileira,
            composto pelas ações mais negociadas da B3. Comparar a alta de uma
            ação contra o Ibov é o primeiro filtro para entender se a
            valorização é mérito do ativo ou simplesmente carona no movimento
            geral do mercado.
          </p>
          <ul class="mt-4 space-y-3" :style="{ color: 'var(--brand-text-muted)' }">
            <li>
              <strong :style="{ color: 'var(--brand-text)' }">Alta acima do Ibov:</strong>
              outperformance. A ação subiu mais que o índice, indicando catalisador
              específico (resultado, fluxo, expectativa setorial).
            </li>
            <li>
              <strong :style="{ color: 'var(--brand-text)' }">Alta acompanhando o Ibov:</strong>
              beta de mercado. A ação está apenas sendo arrastada pelo movimento
              geral, sem destaque próprio.
            </li>
            <li>
              <strong :style="{ color: 'var(--brand-text)' }">Alta sozinha enquanto Ibov cai:</strong>
              catalisador específico forte. Pode ser resultado positivo, M&A,
              mudança regulatória favorável ou rotação setorial.
            </li>
          </ul>
          <p class="mt-4 leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
            Use o ranking para encontrar candidatos de momentum, mas confirme
            sempre com análise fundamentalista antes de qualquer entrada.
          </p>
        </article>

        <!-- Top Gainers vs Buy and Hold -->
        <article
          class="border-t pt-8"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <h2>Top Gainers vs Buy and Hold</h2>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <div
              class="rounded-2xl border p-5"
              :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }"
            >
              <h3 class="mb-2 text-base font-medium" :style="{ color: 'var(--brand-text)' }">
                Top Gainers (Momentum)
              </h3>
              <p class="text-sm leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
                Estratégia de curto a médio prazo focada em ativos com forte
                valorização recente. Aposta na continuação da tendência (3-12
                meses). Exige acompanhamento ativo, gestão de risco e
                definição clara de stop loss. Riscos: reversão rápida, entrada
                tardia, custos de transação.
              </p>
            </div>
            <div
              class="rounded-2xl border p-5"
              :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }"
            >
              <h3 class="mb-2 text-base font-medium" :style="{ color: 'var(--brand-text)' }">
                Buy and Hold (Longo Prazo)
              </h3>
              <p class="text-sm leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
                Estratégia clássica de longo prazo, popularizada por Warren
                Buffett. Foco em qualidade do negócio, vantagem competitiva e
                preço justo. Holding period de 5+ anos. Tolera quedas de curto
                prazo desde que a tese fundamental esteja intacta.
              </p>
            </div>
          </div>
          <p class="mt-4 leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
            Não confunda valorização recente com qualidade. Algumas das maiores
            altas vêm de empresas em recuperação após queda forte (efeito base),
            enquanto outras refletem fundamentos sólidos sendo finalmente
            reconhecidos pelo mercado.
          </p>
        </article>

        <!-- Como Analisar uma Ação que Subiu Muito -->
        <article
          class="border-t pt-8"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <h2>Como Analisar uma Ação que Subiu Muito</h2>
          <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
            Antes de entrar em uma ação que aparece no topo do ranking, siga este
            checklist de 5 passos para evitar entrar tarde em movimento já
            esticado.
          </p>
          <ol class="mt-4 space-y-3 list-decimal pl-5" :style="{ color: 'var(--brand-text-muted)' }">
            <li>
              <strong :style="{ color: 'var(--brand-text)' }">Verificar o trigger:</strong>
              o que causou a alta? Resultado trimestral, fusão e aquisição
              (M&A), nova regulação, lançamento de produto, dividendo
              extraordinário? Sem trigger identificável, desconfie.
            </li>
            <li>
              <strong :style="{ color: 'var(--brand-text)' }">Olhar P/L atual vs setor:</strong>
              a ação ficou cara depois da alta? Compare o múltiplo Preço/Lucro
              (P/L) atual com a média do setor e com o histórico da própria
              empresa.
            </li>
            <li>
              <strong :style="{ color: 'var(--brand-text)' }">Conferir o volume financeiro:</strong>
              alta com volume crescente é movimento real, com participação
              institucional. Alta sem volume costuma ser especulação ou
              manipulação de baixa liquidez.
            </li>
            <li>
              <strong :style="{ color: 'var(--brand-text)' }">Analisar valor relativo:</strong>
              a ação subiu mais que pares do mesmo setor? Mais que o Ibovespa?
              Pode haver razão estrutural ou simples descolamento temporário.
            </li>
            <li>
              <strong :style="{ color: 'var(--brand-text)' }">Decidir: comprar ou esperar:</strong>
              tendência forte com fundamentos = entrada possível em pull-back
              (correção). Sem fundamentos = melhor passar e procurar próxima
              oportunidade.
            </li>
          </ol>
        </article>

        <!-- Glossário Rápido -->
        <article
          class="border-t pt-8"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <h2>Glossário Rápido</h2>
          <dl class="mt-4 space-y-3" :style="{ color: 'var(--brand-text-muted)' }">
            <div>
              <dt class="font-medium" :style="{ color: 'var(--brand-text)' }">Top gainers</dt>
              <dd>Termo em inglês usado por traders para se referir aos ativos com maior alta percentual em um período.</dd>
            </div>
            <div>
              <dt class="font-medium" :style="{ color: 'var(--brand-text)' }">Momentum</dt>
              <dd>Tendência de continuação do movimento de preços. Ações em alta tendem a continuar subindo no curto prazo (3-12 meses).</dd>
            </div>
            <div>
              <dt class="font-medium" :style="{ color: 'var(--brand-text)' }">Beta</dt>
              <dd>Sensibilidade de uma ação em relação ao mercado. Beta acima de 1 indica ativo mais volátil que o Ibovespa.</dd>
            </div>
            <div>
              <dt class="font-medium" :style="{ color: 'var(--brand-text)' }">Outperformance / Underperformance</dt>
              <dd>Quando o ativo sobe acima (out) ou abaixo (under) do índice de referência (Ibovespa).</dd>
            </div>
            <div>
              <dt class="font-medium" :style="{ color: 'var(--brand-text)' }">Catalisador</dt>
              <dd>Evento específico que move o preço da ação: resultado, fusão, regulação, dividendo extraordinário.</dd>
            </div>
            <div>
              <dt class="font-medium" :style="{ color: 'var(--brand-text)' }">IBOV / Ibovespa</dt>
              <dd>Principal índice da bolsa brasileira (B3), composto pelas ações mais negociadas. Funciona como termômetro do mercado.</dd>
            </div>
            <div>
              <dt class="font-medium" :style="{ color: 'var(--brand-text)' }">Volume financeiro</dt>
              <dd>Total negociado em reais. Alto volume confirma o movimento de preço, baixo volume sinaliza fragilidade técnica.</dd>
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
    question: 'O que faz uma ação subir muito em 30 dias?',
    answer:
      'Quatro motivos principais: (1) trigger fundamental como resultado trimestral acima do esperado, (2) mudança setorial favorável (alta de commodities, queda de juros), (3) entrada de fluxo institucional comprador (estrangeiros, fundos), e (4) recuperação técnica após queda forte (efeito base). Sempre identifique o motivo antes de comprar.',
  },
  {
    question: 'O que é momentum em investimentos?',
    answer:
      'Momentum é a estratégia que aposta na continuação de tendências de preço. Estatisticamente comprovada em horizontes de 3 a 12 meses (estudos de Jegadeesh & Titman), funciona melhor em mercados com tendências claras. Pode reverter rápido quando o ciclo muda, exigindo gestão ativa e stop loss.',
  },
  {
    question: 'Devo comprar a ação que mais subiu no mês?',
    answer:
      'Não automaticamente. Verifique o trigger da alta, P/L atual versus setor, volume financeiro acompanhando o movimento, e fundamentos da empresa. Comprar simplesmente porque subiu é estratégia perdedora no longo prazo. Use o ranking como filtro, não como sinal de compra.',
  },
  {
    question: 'Como o Ibovespa influencia o ranking?',
    answer:
      'O Ibovespa é o benchmark da bolsa brasileira. Se uma ação subiu 10% e o Ibov subiu 8%, a ação está acompanhando o mercado (beta). Se subiu 10% com Ibov caindo 3%, há catalisador específico (alfa). Use a comparação para distinguir alta estrutural de simples carona no índice.',
  },
  {
    question: 'Top gainers e blue chips são a mesma coisa?',
    answer:
      'Não. Top gainers é quem subiu mais recentemente, podendo ser empresas pequenas ou de baixa liquidez. Blue chips são empresas grandes, consolidadas e com histórico longo (ITUB4, VALE3, PETR4, WEGE3, B3SA3). Blue chips podem aparecer entre top gainers em ciclos específicos, mas não é a regra.',
  },
]

const crossLinks = [
  {
    path: '/ranking/maiores-baixas-mes',
    title: 'Maiores Baixas do Mês',
    description: 'As 50 ações e FIIs com maior queda nos últimos 30 dias.',
    icon: 'i-lucide-trending-down',
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
  title: 'Maiores Altas do Mês na Bolsa Brasileira | Redentia',
  description:
    'Ranking das 50 ações e FIIs que mais subiram nos últimos 30 dias na B3. Top gainers, momentum, comparativo com Ibovespa. Atualizado diário.',
  path: '/ranking/maiores-altas-mes',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Rankings', path: '/ranking' },
    { name: 'Maiores Altas do Mês', path: '/ranking/maiores-altas-mes' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Maiores Altas do Mês na Bolsa Brasileira',
      description: 'Ações e FIIs que mais subiram nos últimos 30 dias na B3.',
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
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
  'ranking-altas-mes',
  () => service.getMonthlyChange('top', activeType.value === 'all' ? null : activeType.value, 50),
  { watch: [activeType], default: () => [] }
)

// V5 bindings — leader + chips + status meta
const leader = computed(() => {
  const list = rows.value as any[] | null
  return list && list.length ? list[0] : null
})

const heroChips: RankingHeroChip[] = [
  { label: 'Atualizado diário', tone: 'positive' },
  { label: 'Variação 30 dias' },
  { label: 'Dados oficiais B3' },
  { label: 'Comparativo Ibov' },
]

const statusMeta = computed(() => {
  const count = rows.value?.length || 50
  return `Top ${count} · Variação 30d · B3`
})
</script>

<style scoped>
.altas-content {
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
  .altas-content { padding: 64px 32px 96px; }
}
@media (min-width: 1024px) {
  .altas-content { padding: 80px 56px 120px; }
}

.altas-table-toolbar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
}
@media (min-width: 640px) {
  .altas-table-toolbar {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    gap: 24px;
  }
}
.altas-table-toolbar-meta { display: flex; flex-direction: column; gap: 4px; }
.altas-table-toolbar-eyebrow {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-primary);
  margin: 0;
}
.altas-table-toolbar-count {
  font-size: 15px;
  font-weight: 400;
  color: var(--text-heading);
  margin: 0;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

.altas-answer-first {
  font-size: 15px;
  line-height: 1.7;
  color: var(--brand-text-muted);
  text-align: center;
  max-width: 68ch;
  margin: 8px auto 0;
}
</style>

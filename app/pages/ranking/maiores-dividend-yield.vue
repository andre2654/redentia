<template>
  <NuxtLayout name="default" title="Maiores Dividend Yields da Bolsa">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Hero -->
      <div class="flex flex-col gap-3">
        <NuxtLink
          to="/ranking"
          class="flex items-center gap-1 text-xs transition hover:opacity-80"
          :style="{ color: 'var(--brand-text-muted)' }"
        >
          <UIcon name="i-lucide-chevron-left" class="size-3" />
          Todos os rankings
        </NuxtLink>
        <div class="flex items-center gap-3">
          <div
            class="flex size-12 items-center justify-center rounded-xl"
            :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 14%, transparent)' }"
          >
            <UIcon
              name="i-lucide-coins"
              class="size-6"
              :style="{ color: 'var(--brand-primary)' }"
            />
          </div>
          <div>
            <p
              class="text-[10px] font-medium uppercase tracking-[0.15em]"
              :style="{ color: 'var(--brand-text-muted)' }"
            >
              Ações e FIIs com Renda Passiva Mensal
            </p>
            <h1
              class="font-light"
              :style="{
                color: 'var(--brand-text)',
                fontSize: 'clamp(28px, 4vw, 36px)',
                lineHeight: 1.05,
                letterSpacing: '-0.7px',
              }"
            >Maiores Dividend Yields</h1>
          </div>
        </div>
        <p class="max-w-3xl text-base" :style="{ color: 'var(--brand-text-muted)' }">
          As 50 ações e fundos imobiliários (FIIs) com maiores dividend yields da bolsa brasileira (B3) nos últimos 12 meses (TTM). Inclui dividendos pagos por bancos (BBSE3, ITUB4, BBDC4, BBAS3), seguradoras, energia, saneamento, FIIs de tijolo (HGLG11) e FIIs de papel (MXRF11, KNIP11, KNCR11). Ranking atualizado diariamente após pregão, baseado em dados oficiais. Considera dividendos + JCP (Juros sobre Capital Próprio).
        </p>
      </div>

      <!-- Answer-first paragraph for AI citation -->
      <p class="text-base md:text-lg" :style="{ color: 'var(--brand-text)' }">
        Dividend Yield (DY) é o percentual de dividendos pagos por uma ação ou FII em relação ao seu preço atual: DY = (Dividendos 12 meses ÷ Preço Atual) × 100. Considerado bom: 4-8% para ações maduras, 8-12% para FIIs. DY acima de 12% pode indicar oportunidade ou armadilha de valor (value trap), exige análise do payout, geração de caixa e sustentabilidade. Este ranking lista os 50 ativos com maior DY da B3.
      </p>

      <!-- Type filter tabs -->
      <div
        class="inline-flex gap-1 rounded-xl border p-1"
        :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }"
      >
        <button
          v-for="tab in tabs"
          :key="tab.value ?? 'all'"
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs font-medium transition"
          :style="{
            backgroundColor: activeType === tab.value ? 'var(--brand-primary)' : 'transparent',
            color: activeType === tab.value ? activeTabColor : 'var(--brand-text-muted)',
          }"
          @click="activeType = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Table -->
      <div v-if="pending" class="flex items-center justify-center py-16">
        <UIcon name="i-lucide-loader" class="size-6 motion-safe:animate-spin" />
      </div>
      <MoleculesRankingTable
        v-else
        :rows="rows"
        :columns="['dy', 'pe', 'change', 'marketCap']"
        change-label="Hoje"
      />

      <!-- SEO content -->
      <article
        class="mt-8 flex flex-col gap-6 border-t pt-8"
        :style="{ borderColor: 'var(--brand-border)' }"
      >
        <h2>O que é Dividend Yield?</h2>
        <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
          Dividend Yield (DY) é o indicador que mostra quanto uma empresa pagou em dividendos nos últimos 12 meses em relação ao preço atual da ação. Um DY de 10% significa que, para cada R$ 100 investidos, o acionista recebeu R$ 10 em proventos no período. É o principal termômetro de renda passiva no Brasil, usado tanto pra ações de setores maduros (bancos, energia, saneamento, transmissão, seguradoras) quanto pra fundos imobiliários, onde o fluxo de dividendos é mais estável e previsível mês a mês.
        </p>
        <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
          A fórmula do DY considera dividendos + JCP (Juros sobre Capital Próprio) pagos nos últimos 12 meses dividido pelo preço da cota hoje. Como o numerador é histórico e o denominador é atual, o indicador sobe quando o preço cai e desce quando o preço sobe, mesmo sem mudança nos pagamentos. Por isso usar DY isolado pode enganar, sempre cruze com payout, geração de caixa, dívida líquida e consistência de pagamento dos últimos 5 anos.
        </p>

        <h3>Como o ranking é calculado?</h3>
        <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
          O ranking considera o dividend yield nos últimos 12 meses (TTM), cruzando os dividendos pagos com o preço atual de cada ativo. Aplicamos filtros de qualidade para evitar distorções: excluímos DY acima de 50% (tipicamente erros de dados) e ativos sem histórico recente de pagamentos. Os dados vêm direto do feed oficial da B3 + filtros internos de saneamento (anti split/subscrição mal classificada).
        </p>

        <h3>Atenção ao "DY alto demais"</h3>
        <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
          Um DY muito elevado pode indicar tanto uma oportunidade quanto uma armadilha de valor (<em>value trap</em>). Quando o preço da ação cai muito por problemas fundamentais, o DY histórico sobe artificialmente, mas dividendos futuros podem ser cortados. Use o ranking como ponto de partida e sempre analise o histórico de 5 anos, payout (acima de 80% pra ações é arriscado), geração de caixa operacional e endividamento.
        </p>

        <!-- Top ações pagadoras -->
        <h2>Melhores Ações Pagadoras de Dividendos em 2026</h2>
        <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
          Lista das ações brasileiras com histórico mais consistente de pagamento de dividendos, usadas como núcleo de carteiras de renda passiva. Ordem foca em consistência (5+ anos pagando) mais do que em DY pico do momento.
        </p>
        <div class="grid gap-3 md:grid-cols-2">
          <div
            v-for="acao in topAcoes"
            :key="acao.ticker"
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <div class="flex items-baseline gap-2">
              <NuxtLink
                :to="`/asset/${acao.ticker}`"
                class="font-semibold transition hover:opacity-80"
                :style="{ color: 'var(--brand-primary)' }"
              >
                {{ acao.ticker }}
              </NuxtLink>
              <span class="text-xs" :style="{ color: 'var(--brand-text-muted)' }">{{ acao.nome }}</span>
            </div>
            <p class="mt-1 text-sm" :style="{ color: 'var(--brand-text)' }">{{ acao.descricao }}</p>
          </div>
        </div>

        <!-- Top FIIs pagadores -->
        <h2>Melhores FIIs Pagadores de Dividendos Mensais</h2>
        <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
          Os fundos imobiliários listados na B3 são obrigados por lei a distribuir 95% do lucro semestralmente, mas a maioria distribui mensalmente, daí o apelo pra renda passiva. Separamos por categoria.
        </p>
        <h3>FIIs de Tijolo (imóveis físicos)</h3>
        <div class="grid gap-3 md:grid-cols-2">
          <div
            v-for="fii in fiisTijolo"
            :key="fii.ticker"
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <div class="flex items-baseline gap-2">
              <NuxtLink
                :to="`/asset/${fii.ticker}`"
                class="font-semibold transition hover:opacity-80"
                :style="{ color: 'var(--brand-primary)' }"
              >
                {{ fii.ticker }}
              </NuxtLink>
              <span class="text-xs" :style="{ color: 'var(--brand-text-muted)' }">{{ fii.nome }}</span>
            </div>
            <p class="mt-1 text-sm" :style="{ color: 'var(--brand-text)' }">{{ fii.descricao }}</p>
          </div>
        </div>
        <h3>FIIs de Papel (CRIs e debêntures)</h3>
        <div class="grid gap-3 md:grid-cols-2">
          <div
            v-for="fii in fiisPapel"
            :key="fii.ticker"
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <div class="flex items-baseline gap-2">
              <NuxtLink
                :to="`/asset/${fii.ticker}`"
                class="font-semibold transition hover:opacity-80"
                :style="{ color: 'var(--brand-primary)' }"
              >
                {{ fii.ticker }}
              </NuxtLink>
              <span class="text-xs" :style="{ color: 'var(--brand-text-muted)' }">{{ fii.nome }}</span>
            </div>
            <p class="mt-1 text-sm" :style="{ color: 'var(--brand-text)' }">{{ fii.descricao }}</p>
          </div>
        </div>

        <!-- FIIs de Papel vs Tijolo -->
        <h2>FIIs de Papel vs FIIs de Tijolo</h2>
        <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
          As duas grandes famílias de fundos imobiliários têm dinâmicas, riscos e correlações diferentes. Misturar as duas é o primeiro passo pra diversificar uma carteira de renda passiva.
        </p>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2" :style="{ color: 'var(--brand-primary)' }">FIIs de Tijolo</h4>
            <p class="text-sm" :style="{ color: 'var(--brand-text)' }">
              Investem em imóveis físicos (galpões logísticos, lajes corporativas, shoppings, hospitais, agências bancárias) e geram receita via aluguel. DY tipicamente 8-10%, valor da cota oscila com o ciclo imobiliário, vacância, reajustes contratuais (IGP-M ou IPCA) e taxa de juros longa. Bom contra inflação no longo prazo, mas mais sensível a recessão.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2" :style="{ color: 'var(--brand-primary)' }">FIIs de Papel</h4>
            <p class="text-sm" :style="{ color: 'var(--brand-text)' }">
              Investem em CRIs (Certificados de Recebíveis Imobiliários), LCIs e debêntures, recebem juros corrigidos por IPCA ou CDI. DY tipicamente 9-13%, mais correlacionado com Selic, CDI e IPCA do que com mercado imobiliário físico. Distribuem mensalmente quase como renda fixa estruturada, mas com risco de crédito do emissor do CRI.
            </p>
          </div>
        </div>

        <!-- Dividendos vs JCP -->
        <h2>Dividendos vs JCP (Juros sobre Capital Próprio)</h2>
        <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
          As empresas brasileiras podem remunerar acionistas de duas formas, e ambas contam pro dividend yield deste ranking.
        </p>
        <div class="flex flex-col gap-3">
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <p class="text-sm" :style="{ color: 'var(--brand-text)' }">
              <strong>Dividendos</strong>: distribuição direta de lucro líquido. Atualmente ISENTOS de Imposto de Renda pra pessoa física no recebimento (regra desde 1996).
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <p class="text-sm" :style="{ color: 'var(--brand-text)' }">
              <strong>JCP (Juros sobre Capital Próprio)</strong>: remuneração que a empresa pode deduzir da base do IR corporativo (IRPJ + CSLL), gerando economia tributária. Ao acionista chega líquido com 15% de IR retido na fonte, mas como a empresa pagou menos imposto, o efeito combinado costuma ser melhor que dividendo puro.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <p class="text-sm" :style="{ color: 'var(--brand-text)' }">
              <strong>Por que bancos usam tanto JCP</strong>: Itaú, Bradesco, Santander e BB têm caixa de sobra e patrimônio líquido alto, então maximizam o JCP pra reduzir IR corporativo. Por isso aparecem todo mês com DY consistente.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <p class="text-sm" :style="{ color: 'var(--brand-text)' }">
              <strong>Tributação 2026</strong>: o PL 1.087/2025 propõe alíquota de 10% sobre dividendos recebidos acima de R$ 50 mil/mês por pessoa física. Está em discussão no Senado, vigência provável a partir de 2027 caso aprovado. Não afeta investidores de renda passiva comum, mas muda o cálculo pra grandes patrimônios.
            </p>
          </div>
        </div>

        <!-- Setores por DY -->
        <h2>Setores com Maiores Dividendos na B3</h2>
        <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
          Mapa rápido de onde os dividendos vivem na bolsa brasileira. Use pra montar uma carteira de renda passiva diversificada por setor, evitando concentração de risco.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
            >
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', color: 'var(--brand-text)' }">Setor</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', color: 'var(--brand-text)' }">DY Médio</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', color: 'var(--brand-text)' }">Top Tickers</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(setor, idx) in setoresDividendos" :key="setor.nome" :style="idx % 2 === 1 ? { backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' } : {}">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', color: 'var(--brand-text)' }">{{ setor.nome }}</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', color: 'var(--brand-primary)' }">{{ setor.dy }}</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', color: 'var(--brand-text)' }">{{ setor.tickers }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">
          Setores cíclicos (commodities, varejo, construção) podem entregar DY pontual alto após anos bons, mas tendem a oscilar muito. Pra renda recorrente, prefira utilities (energia, saneamento, transmissão) e financeiro.
        </p>

        <!-- Estratégia renda passiva -->
        <h2>Estratégia de Renda Passiva Mensal com Dividendos</h2>
        <p class="leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
          Cinco regras práticas pra quem quer construir um fluxo previsível de dividendos sem cair em armadilha de valor.
        </p>
        <div class="space-y-3">
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full font-bold" :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 18%, transparent)', color: 'var(--brand-primary)' }">1</div>
            <div>
              <h4 :style="{ color: 'var(--brand-text)' }">Diversifique por classe e setor</h4>
              <p class="text-sm" :style="{ color: 'var(--brand-text)' }">Combine 5-10 ações com 5-10 FIIs de setores diferentes (bancos, energia, transmissão, FIIs de tijolo, FIIs de papel). Evita concentração de risco específico.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full font-bold" :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 18%, transparent)', color: 'var(--brand-primary)' }">2</div>
            <div>
              <h4 :style="{ color: 'var(--brand-text)' }">Foque em consistência, não em DY pico</h4>
              <p class="text-sm" :style="{ color: 'var(--brand-text)' }">Empresa que pagou dividendo todos os anos nos últimos 5 anos vale mais que uma com DY de 18% mas histórico errático. Veja o gráfico de proventos do ativo.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full font-bold" :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 18%, transparent)', color: 'var(--brand-primary)' }">3</div>
            <div>
              <h4 :style="{ color: 'var(--brand-text)' }">Reinvista enquanto está acumulando</h4>
              <p class="text-sm" :style="{ color: 'var(--brand-text)' }">Reinvestir dividendos é o segredo do efeito composto. Só comece a "viver dos dividendos" quando o patrimônio for suficiente, antes disso reinveste tudo.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full font-bold" :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 18%, transparent)', color: 'var(--brand-primary)' }">4</div>
            <div>
              <h4 :style="{ color: 'var(--brand-text)' }">Combine FIIs (mensais) com ações (trimestrais)</h4>
              <p class="text-sm" :style="{ color: 'var(--brand-text)' }">FIIs distribuem todo mês, ações geralmente trimestral ou semestral. Misturar os dois alisa a curva mensal de proventos.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full font-bold" :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 18%, transparent)', color: 'var(--brand-primary)' }">5</div>
            <div>
              <h4 :style="{ color: 'var(--brand-text)' }">Atenção ao payout</h4>
              <p class="text-sm" :style="{ color: 'var(--brand-text)' }">Payout acima de 80% pra ações é arriscado, sinal de que a empresa distribui quase tudo o que ganha e tem pouco caixa pra investir ou aguentar crise. Pra FIIs o payout obrigatório é 95%, então o risco é outro (vacância, calote em CRI).</p>
            </div>
          </div>
        </div>

        <!-- Glossário -->
        <h2>Glossário Rápido</h2>
        <dl class="grid gap-3 md:grid-cols-2">
          <div
            v-for="termo in glossario"
            :key="termo.sigla"
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <dt class="font-semibold" :style="{ color: 'var(--brand-primary)' }">{{ termo.sigla }}</dt>
            <dd class="mt-1 text-sm" :style="{ color: 'var(--brand-text)' }">{{ termo.definicao }}</dd>
          </div>
        </dl>

        <!-- FAQ -->
        <h2>Perguntas Frequentes sobre Dividend Yield</h2>
        <div class="space-y-4">
          <details
            v-for="faq in faqItems"
            :key="faq.q"
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between gap-3" :style="{ color: 'var(--brand-text)' }">
              <span class="font-medium">{{ faq.q }}</span>
              <UIcon name="i-lucide-chevron-down" class="size-5 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm" :style="{ color: 'var(--brand-text)' }">{{ faq.a }}</p>
          </details>
        </div>
      </article>

      <!-- Outros Rankings -->
      <div
        class="flex flex-col gap-4 rounded-[30px] p-6"
        :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
      >
        <h2>Outros Rankings</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            v-for="link in outrosRankings"
            :key="link.to"
            :to="link.to"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <UIcon
              :name="link.icon"
              class="size-8 shrink-0"
              :style="{ color: 'var(--brand-primary)' }"
            />
            <div>
              <h3 :style="{ color: 'var(--brand-text)' }">{{ link.titulo }}</h3>
              <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">{{ link.descricao }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

import { readableOn } from '~/utils/color'

const brand = useBrand()
const service = useAssetsService()

// Cor de contraste pra texto do tab ativo. Calculada uma vez no setup
// pra que SSR e CSR produzam o mesmo valor estavel (anti-hydration flash).
const activeTabColor = readableOn(brand.colors.primary)

type TickerType = 'STOCK' | 'REIT' | 'ETF' | null

const tabs: Array<{ label: string; value: TickerType }> = [
  { label: 'Todos', value: null },
  { label: 'Ações', value: 'STOCK' },
  { label: 'FIIs', value: 'REIT' },
  { label: 'ETFs', value: 'ETF' },
]

const activeType = ref<TickerType>(null)

const { data: rows, pending } = await useAsyncData(
  'ranking-dy',
  () => service.getTopDividendYield(activeType.value, 50),
  {
    watch: [activeType],
    default: () => [],
  }
)

// ====================================================================
// Top acoes pagadoras de dividendos — escolhidas por consistencia 5+ anos
// + relevancia em buscas. Ordem prioriza bancos (BBSE3, ITUB4, BBDC4,
// BBAS3) que dominam o ranking de DY recorrente, depois utilities
// (TAEE11, TRPL4, CMIG4) e defensivas (ABEV3).
// ====================================================================
const topAcoes = [
  { ticker: 'ITUB4', nome: 'Itaú Unibanco', descricao: 'Payout consistente de 50-60%, DY histórico 5-8%. Distribui via JCP, paga em ciclos mensais e trimestrais.' },
  { ticker: 'ITSA4', nome: 'Itaúsa', descricao: 'Holding controladora do Itaú e outras empresas (Alpargatas, Dexco, NTS). DY 6-9%, exposição a Itaú com desconto de holding.' },
  { ticker: 'BBAS3', nome: 'Banco do Brasil', descricao: 'DY 8-12%, banco estatal lucrativo com payout alto. Sensível a cenário político e direcionamento de crédito.' },
  { ticker: 'BBSE3', nome: 'BB Seguridade', descricao: 'DY 7-9%, seguradora ligada ao BB. Payout próximo de 90%, modelo capital-light gera caixa estável.' },
  { ticker: 'BBDC4', nome: 'Bradesco', descricao: 'DY 5-7%, banco privado com payout consistente. Estratégia mais conservadora que ITUB4.' },
  { ticker: 'TAEE11', nome: 'Taesa', descricao: 'Transmissão elétrica, contratos longos indexados ao IPCA. DY 7-10%, baixa volatilidade.' },
  { ticker: 'CMIG4', nome: 'Cemig', descricao: 'Geração e distribuição de energia em Minas Gerais. DY variável 6-12% conforme tarifa e dívida.' },
  { ticker: 'TRPL4', nome: 'Transmissão Paulista', descricao: 'Transmissão de energia, fluxo previsível. DY 8-11%, perfil parecido com Taesa.' },
  { ticker: 'ABEV3', nome: 'Ambev', descricao: 'Defensiva clássica, líder de cervejas. DY 4-6%, payout regular, geração de caixa robusta.' },
] as const

// FIIs de tijolo — investem em imoveis fisicos, DY 8-10% medio
const fiisTijolo = [
  { ticker: 'HGLG11', nome: 'CGHG Logística', descricao: 'Galpões logísticos premium em SP, RJ e MG. Maior FII de tijolo do Brasil.' },
  { ticker: 'VISC11', nome: 'Vinci Shopping Centers', descricao: 'Shoppings em capitais brasileiras. Receita atrelada a aluguel + percentual de vendas dos lojistas.' },
  { ticker: 'HSML11', nome: 'HSI Malls', descricao: 'Shopping centers em cidades médias. Maior exposição ao consumo regional.' },
  { ticker: 'GGRC11', nome: 'GGR Covepi Renda', descricao: 'Logística e built-to-suit. Contratos longos atípicos com inquilinos âncora.' },
  { ticker: 'BCFF11', nome: 'BTG Pactual Fundo de Fundos', descricao: 'Fundo de fundos: investe em outros FIIs. Diversificação automática em uma cota só.' },
] as const

// FIIs de papel — investem em CRIs, debentures, recebem juros
const fiisPapel = [
  { ticker: 'MXRF11', nome: 'Maxi Renda', descricao: 'CRIs diversificados, valor de cota baixa, FII mais popular de entry-level no Brasil.' },
  { ticker: 'KNCR11', nome: 'Kinea Rendimentos Imobiliários', descricao: 'CRIs corporativos high grade indexados ao CDI. Renda mensal estável.' },
  { ticker: 'KNIP11', nome: 'Kinea Índices de Preços', descricao: 'CRIs indexados ao IPCA. Proteção contra inflação no longo prazo.' },
  { ticker: 'DIVD11', nome: 'Maua Capital Recebíveis', descricao: 'High yield, busca CRIs com spread maior. DY tipicamente acima de 12%.' },
  { ticker: 'SNLG11', nome: 'Suno Logística', descricao: 'Mistura tijolo logístico + recebíveis. Estratégia híbrida de geração de caixa.' },
] as const

// Setores agrupados — copia direta do mapa de DY medio por categoria
const setoresDividendos = [
  { nome: 'Bancos', dy: '6-9%', tickers: 'ITUB4, BBAS3, BBDC4, ITSA4' },
  { nome: 'Seguradoras', dy: '7-10%', tickers: 'BBSE3, IRBR3, CXSE3' },
  { nome: 'Energia (Geração)', dy: '6-10%', tickers: 'CMIG4, ELET6, EGIE3' },
  { nome: 'Energia (Transmissão)', dy: '8-11%', tickers: 'TAEE11, TRPL4, ALUP11' },
  { nome: 'Saneamento', dy: '5-7%', tickers: 'SBSP3, SAPR11, CSMG3' },
  { nome: 'FIIs de Tijolo', dy: '8-10%', tickers: 'HGLG11, VISC11, GGRC11' },
  { nome: 'FIIs de Papel', dy: '9-13%', tickers: 'MXRF11, KNCR11, DIVD11' },
] as const

// Glossario — termos que o leitor de renda passiva precisa decodificar
const glossario = [
  { sigla: 'DY (Dividend Yield)', definicao: 'Percentual de dividendos pagos nos últimos 12 meses dividido pelo preço atual. Mostra rentabilidade em proventos.' },
  { sigla: 'TTM (Trailing Twelve Months)', definicao: 'Janela móvel dos últimos 12 meses. Usada pra calcular DY, lucro, receita.' },
  { sigla: 'JCP (Juros sobre Capital Próprio)', definicao: 'Forma de remuneração ao acionista que a empresa pode deduzir do IR corporativo. Tem 15% de IR retido na fonte.' },
  { sigla: 'Payout', definicao: 'Percentual do lucro líquido distribuído como dividendo. Acima de 80% pra ações é arriscado.' },
  { sigla: 'Value Trap', definicao: 'Ação com DY artificialmente alto porque o preço caiu por problemas fundamentais. Dividendos futuros podem ser cortados.' },
  { sigla: 'Data-com / Data-ex', definicao: 'Data-com: último dia pra ter direito ao dividendo. Data-ex: dia em que a ação passa a ser negociada sem direito ao provento.' },
  { sigla: 'DY on Cost', definicao: 'Dividend yield calculado sobre o preço médio de aquisição, não sobre preço atual. Mostra o "yield real" da sua posição.' },
  { sigla: 'Provento', definicao: 'Termo guarda-chuva pra qualquer pagamento ao acionista: dividendo, JCP, bonificação ou subscrição.' },
] as const

// FAQ — fonte unica para HTML <details> e FAQPage schema (mainEntity)
const faqItems = [
  {
    q: 'Qual é considerado um bom Dividend Yield?',
    a: 'Para ações maduras (bancos, energia, saneamento) entre 4-8% é considerado bom. Para FIIs entre 8-12% é o padrão de mercado. DY acima de 12% pode ser oportunidade ou armadilha de valor (value trap), exige análise de payout, geração de caixa, dívida líquida e consistência histórica antes de comprar.',
  },
  {
    q: 'Quais ações pagam mais dividendos no Brasil?',
    a: 'As mais consistentes em pagamento recorrente: ITUB4 (Itaú), BBAS3 (Banco do Brasil), BBSE3 (BB Seguridade), TAEE11 (Taesa), CMIG4 (Cemig), BBDC4 (Bradesco), TRPL4 (Transmissão Paulista) e ITSA4 (Itaúsa). Bancos e utilities dominam por terem fluxo de caixa previsível e modelo capital-light.',
  },
  {
    q: 'Quais FIIs pagam dividendos mensais?',
    a: 'Praticamente todos os FIIs distribuem mensalmente, já que a lei obriga 95% do lucro semestralmente e a maioria optou por mensalizar. Os mais populares por volume e consistência: HGLG11 (galpões logísticos), MXRF11 (CRIs entry-level), KNCR11 (CRIs CDI), KNIP11 (CRIs IPCA), GGRC11 (logística built-to-suit) e VISC11 (shoppings).',
  },
  {
    q: 'Qual a diferença entre dividendos e JCP?',
    a: 'Dividendos vêm direto do lucro líquido e atualmente são isentos de IR pra pessoa física no recebimento. JCP (Juros sobre Capital Próprio) é uma forma de remuneração que a empresa pode deduzir do IR corporativo, mas tem 15% retido na fonte ao chegar no acionista. Bancos como Itaú e Bradesco usam muito JCP por economia tributária. Ambos contam para o cálculo do DY neste ranking.',
  },
  {
    q: 'Como funciona a tributação de dividendos a partir de 2026?',
    a: 'O PL 1.087/2025 propõe alíquota de 10% sobre dividendos recebidos acima de R$ 50 mil por mês por pessoa física. Está em apreciação no Senado, vigência provável a partir de 2027 caso aprovado. Para investidor de renda passiva comum (abaixo do limite mensal), continua isento. Para grandes patrimônios muda significativamente o cálculo de retorno líquido.',
  },
  {
    q: 'O que é value trap em dividendos?',
    a: 'Value trap é uma ação com DY artificialmente alto porque o preço caiu por problemas fundamentais (perda de receita, escândalo, perda de licença, alavancagem alta). O DY de 12 meses inclui dividendos passados, mas a empresa pode cortar ou suspender pagamentos no próximo ciclo. Por isso DY isolado não basta, sempre verifique consistência histórica de 5 anos, payout, geração de caixa e endividamento.',
  },
] as const

// Outros rankings pra cross-link interno (boost de relevancia + retencao)
const outrosRankings = [
  { to: '/ranking/maiores-altas-mes', titulo: 'Maiores Altas do Mês', descricao: 'Ações que mais subiram nos últimos 30 dias na B3.', icon: 'i-lucide-trending-up' },
  { to: '/ranking/maiores-baixas-mes', titulo: 'Maiores Baixas do Mês', descricao: 'Ações que mais caíram, possíveis oportunidades de entrada.', icon: 'i-lucide-trending-down' },
  { to: '/ranking', titulo: 'Todos os Rankings', descricao: 'Veja todos os rankings e filtros disponíveis.', icon: 'i-lucide-list' },
  { to: '/dividendos/calendario', titulo: 'Calendário de Dividendos', descricao: 'Próximos pagamentos por data-com e data-ex.', icon: 'i-lucide-calendar' },
] as const

usePageSeo({
  title: 'Maiores Dividend Yields da Bolsa 2026 | Redentia',
  description:
    'Top 50 ações e FIIs com maiores Dividend Yields da B3. Bancos, seguradoras, transmissão, FIIs de tijolo e papel. Renda passiva mensal. Atualizado diário.',
  path: '/ranking/maiores-dividend-yield',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Rankings', path: '/ranking' },
    { name: 'Maiores Dividend Yields', path: '/ranking/maiores-dividend-yield' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Maiores Dividend Yields da Bolsa Brasileira 2026',
      description: 'Ranking das ações e FIIs com maior dividend yield da B3, atualizado diariamente.',
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: 50,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    },
  ],
})
</script>

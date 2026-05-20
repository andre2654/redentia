<!--
  /dividendos/[ticker] — Dynamic per-ticker dividend SEO landing pages.

  Cada ticker é um canonical próprio que o Google indexa como página
  independente, ranqueando para queries long-tail tipo "dividendos
  PETR4", "quando paga dividendo VALE3", "histórico ITUB4 dividendos".

  Uses TICKERS_INFO map (12 tickers) + tries to fetch real dividend
  history via useAssetsService().getTickerDividends(ticker). Falls back
  gracefully se o endpoint falhar (página renderiza com dados estáticos).
-->
<template>
  <NuxtLayout :name="layoutName" :title="`Dividendos ${ticker}`">
    <section class="flex flex-col gap-8 px-6 py-8">

      <!-- ============ Back-links ============ -->
      <div class="flex flex-col gap-1.5">
        <NuxtLink
          to="/dividendos"
          class="flex items-center gap-1 text-xs transition hover:opacity-80"
          :style="{ color: 'var(--brand-text-muted)' }"
        >
          <UIcon name="i-lucide-chevron-left" class="size-3" />
          Dividendos
        </NuxtLink>
        <NuxtLink
          to="/dividendos/calendario"
          class="flex items-center gap-1 text-xs transition hover:opacity-80"
          :style="{ color: 'var(--brand-text-muted)' }"
        >
          <UIcon name="i-lucide-chevron-left" class="size-3" />
          Calendário de dividendos
        </NuxtLink>
      </div>

      <!-- ============ Hero ============ -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <div
            class="flex size-12 items-center justify-center rounded-xl font-mono-tab text-sm font-semibold"
            :style="{
              backgroundColor: `color-mix(in srgb, var(--brand-primary) 18%, transparent)`,
              color: 'var(--brand-primary)',
            }"
          >
            {{ ticker.slice(0, 3) }}
          </div>
          <div class="flex flex-col">
            <p
              class="text-[10px] font-medium uppercase tracking-[0.15em]"
              :style="{ color: 'var(--brand-text-muted)' }"
            >
              {{ info.type === 'REIT' ? 'Fundo imobiliário' : 'Ação' }} · {{ info.sector }}
            </p>
            <h1
              class="font-light"
              :style="{
                color: 'var(--brand-text)',
                fontSize: 'clamp(28px, 4vw, 36px)',
                lineHeight: 1.05,
                letterSpacing: '-0.7px',
              }"
            >Dividendos de {{ info.fullName }} ({{ ticker }})</h1>
          </div>
        </div>

        <!-- Answer-first paragraph -->
        <p class="max-w-3xl text-base leading-relaxed md:text-lg" :style="{ color: 'var(--brand-text)' }">
          {{ info.answer }}
        </p>

        <!-- Trust badges -->
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs" :style="{ color: 'var(--brand-text-muted)' }">
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-database" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
            Dados B3
          </span>
          <span>·</span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-refresh-cw" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
            Atualizado diariamente
          </span>
          <span>·</span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-history" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
            Histórico completo
          </span>
          <span v-if="lastDividend">·</span>
          <span v-if="lastDividend" class="flex items-center gap-1">
            <UIcon name="i-lucide-calendar-check" class="size-4" :style="{ color: 'var(--brand-positive)' }" />
            Último pagamento {{ formatDateShort(lastDividend.payment_date) }}
          </span>
        </div>

        <p class="text-[11px]" :style="{ color: 'var(--brand-text-muted)' }">
          Última atualização: {{ lastUpdatedText }}
        </p>
      </div>

      <!-- ============ Info cards ============ -->
      <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div
          v-for="card in infoCards"
          :key="card.label"
          class="brand-card flex flex-col gap-1 border p-4"
          :style="{
            backgroundColor: `color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))`,
            borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
          }"
        >
          <span class="text-[10px] font-medium uppercase tracking-[0.12em]" :style="{ color: 'var(--brand-text-muted)' }">
            {{ card.label }}
          </span>
          <span class="text-sm font-medium leading-tight" :style="{ color: 'var(--brand-text)' }">
            {{ card.value }}
          </span>
        </div>
      </div>

      <!-- ============ Tabela de últimos pagamentos ============ -->
      <section class="flex flex-col gap-4">
        <div class="flex items-baseline justify-between gap-3 flex-wrap">
          <h2
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(22px, 2.5vw, 26px)',
              lineHeight: 1.2,
              letterSpacing: '-0.4px',
            }"
          >Últimos Pagamentos de {{ ticker }}</h2>
          <NuxtLink
            :to="`/asset/${ticker.toLowerCase()}`"
            class="text-xs font-medium transition hover:opacity-80"
            :style="{ color: 'var(--brand-primary)' }"
          >
            Ver página completa do ativo
          </NuxtLink>
        </div>

        <div
          v-if="recentDividends.length > 0"
          class="overflow-hidden rounded-2xl border"
          :style="{
            borderColor: 'var(--brand-border)',
            backgroundColor: 'var(--brand-surface)',
          }"
        >
          <div
            class="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 border-b px-4 py-3 font-mono-tab text-[10px] font-medium uppercase tracking-[0.12em]"
            :style="{
              borderColor: 'var(--brand-border)',
              color: 'var(--brand-text-muted)',
              backgroundColor: `color-mix(in srgb, var(--brand-border) 18%, var(--brand-surface))`,
            }"
          >
            <span>Tipo</span>
            <span>Data-com</span>
            <span>Pagamento</span>
            <span class="text-right">Valor</span>
          </div>
          <div
            v-for="(item, idx) in recentDividends"
            :key="`${item.payment_date}-${idx}`"
            class="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 border-b px-4 py-3 text-sm last:border-b-0"
            :style="{ borderColor: 'var(--brand-border)' }"
          >
            <span class="flex items-center gap-1.5">
              <span
                class="size-2 rounded-full"
                :style="{ backgroundColor: getLabelColor(item.label) }"
              />
              <span :style="{ color: 'var(--brand-text)' }">{{ item.label }}</span>
            </span>
            <span class="font-mono-tab tabular-nums" :style="{ color: 'var(--brand-text-muted)' }">
              {{ formatDateShort(item.last_date_prior) }}
            </span>
            <span class="font-mono-tab tabular-nums" :style="{ color: 'var(--brand-text)' }">
              {{ formatDateShort(item.payment_date) }}
            </span>
            <span class="text-right font-mono-tab font-semibold tabular-nums" :style="{ color: 'var(--brand-positive)' }">
              R$ {{ formatRate(item.rate) }}
            </span>
          </div>
        </div>

        <div
          v-else-if="pending"
          class="rounded-2xl border p-6 text-center text-sm"
          :style="{
            borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
            color: 'var(--brand-text-muted)',
          }"
        >
          Carregando histórico de pagamentos...
        </div>

        <div
          v-else
          class="rounded-2xl border p-6 text-center text-sm"
          :style="{
            borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
            color: 'var(--brand-text-muted)',
          }"
        >
          Nenhum pagamento recente registrado para {{ ticker }}. Consulte o
          <NuxtLink
            :to="`/asset/${ticker.toLowerCase()}`"
            class="font-medium underline transition hover:opacity-80"
            :style="{ color: 'var(--brand-primary)' }"
          >
            histórico completo do ativo
          </NuxtLink>
          ou o
          <NuxtLink
            to="/dividendos/calendario"
            class="font-medium underline transition hover:opacity-80"
            :style="{ color: 'var(--brand-primary)' }"
          >
            calendário geral
          </NuxtLink>.
        </div>
      </section>

      <!-- ============ Educational H2s ============ -->
      <section class="flex max-w-4xl flex-col gap-4">
        <h2
          class="font-light"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(22px, 2.5vw, 26px)',
            lineHeight: 1.2,
            letterSpacing: '-0.4px',
          }"
        >Como funciona o pagamento de dividendos do {{ ticker }}</h2>
        <p class="text-base leading-relaxed" :style="{ color: 'var(--brand-text)' }">
          {{ info.howItWorks }}
        </p>
      </section>

      <section class="flex max-w-4xl flex-col gap-4">
        <h2
          class="font-light"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(22px, 2.5vw, 26px)',
            lineHeight: 1.2,
            letterSpacing: '-0.4px',
          }"
        >Histórico recente de {{ ticker }}</h2>
        <p class="text-base leading-relaxed" :style="{ color: 'var(--brand-text)' }">
          {{ info.history }}
        </p>
      </section>

      <section class="flex max-w-4xl flex-col gap-4">
        <h2
          class="font-light"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(22px, 2.5vw, 26px)',
            lineHeight: 1.2,
            letterSpacing: '-0.4px',
          }"
        >Próximos eventos esperados</h2>
        <p class="text-base leading-relaxed" :style="{ color: 'var(--brand-text)' }">
          {{ info.nextEvents }}
        </p>
      </section>

      <!-- ============ FAQ ============ -->
      <section class="flex max-w-4xl flex-col gap-4">
        <h2
          class="font-light"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(22px, 2.5vw, 26px)',
            lineHeight: 1.2,
            letterSpacing: '-0.4px',
          }"
        >Perguntas Frequentes sobre Dividendos do {{ ticker }}</h2>

        <div class="flex flex-col gap-3">
          <details
            v-for="item in faqItems"
            :key="item.q"
            class="group brand-card border p-4"
            :style="{
              backgroundColor: `color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))`,
              borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
            }"
          >
            <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-medium" :style="{ color: 'var(--brand-text)' }">
              {{ item.q }}
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
              {{ item.a }}
            </p>
          </details>
        </div>
      </section>

      <!-- ============ Cross-links: outros do mesmo setor + calculadora ============ -->
      <section class="flex flex-col gap-5">
        <h2
          class="font-light"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(22px, 2.5vw, 26px)',
            lineHeight: 1.2,
            letterSpacing: '-0.4px',
          }"
        >Outros pagadores de dividendos relacionados</h2>

        <div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          <NuxtLink
            v-for="rel in relatedTickers"
            :key="rel.ticker"
            :to="`/dividendos/${rel.ticker.toLowerCase()}`"
            class="group flex flex-col gap-1 rounded-xl border px-3 py-3 transition hover:border-secondary/40"
            :style="{
              backgroundColor: `color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))`,
              borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
            }"
          >
            <span class="font-mono-tab text-sm font-semibold" :style="{ color: 'var(--brand-primary)' }">
              {{ rel.ticker }}
            </span>
            <span class="text-[11px]" :style="{ color: 'var(--brand-text-muted)' }">{{ rel.name }}</span>
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <NuxtLink
            :to="`/calculadora/dividend-yield?ticker=${ticker}`"
            class="group flex items-center justify-between gap-3 rounded-xl border p-4 transition hover:border-secondary/40"
            :style="{
              backgroundColor: `color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))`,
              borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
            }"
          >
            <div class="flex flex-col gap-0.5">
              <span class="text-sm font-medium" :style="{ color: 'var(--brand-text)' }">
                Calculadora de Dividend Yield
              </span>
              <span class="text-xs" :style="{ color: 'var(--brand-text-muted)' }">
                Calcule o DY de {{ ticker }} pelo preço atual
              </span>
            </div>
            <UIcon name="i-lucide-arrow-right" class="size-5" :style="{ color: 'var(--brand-primary)' }" />
          </NuxtLink>

          <NuxtLink
            :to="`/asset/${ticker.toLowerCase()}`"
            class="group flex items-center justify-between gap-3 rounded-xl border p-4 transition hover:border-secondary/40"
            :style="{
              backgroundColor: `color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))`,
              borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
            }"
          >
            <div class="flex flex-col gap-0.5">
              <span class="text-sm font-medium" :style="{ color: 'var(--brand-text)' }">
                Página completa do {{ ticker }}
              </span>
              <span class="text-xs" :style="{ color: 'var(--brand-text-muted)' }">
                Cotação, indicadores, fundamentos e notícias
              </span>
            </div>
            <UIcon name="i-lucide-arrow-right" class="size-5" :style="{ color: 'var(--brand-primary)' }" />
          </NuxtLink>
        </div>
      </section>

      <!-- ============ CTA ============ -->
      <MoleculesCtaSection
        :title="`Acompanhe os dividendos do ${ticker} na sua carteira`"
        :description="`Cadastre-se na ${brand.name} e receba alertas automáticos de cada anúncio de dividendo, JCP ou rendimento das ações e FIIs da sua carteira.`"
        :buttons="[
          { label: 'Criar conta grátis', to: '/auth/register', icon: 'i-lucide-arrow-right', variant: 'primary' },
          { label: 'Ver calendário completo', to: '/dividendos/calendario', variant: 'outline' },
        ]"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
// ====================================================================
// /dividendos/[ticker] — Per-ticker dividend SEO landing page.
//
// Each ticker slug (lowercase) is its own canonical URL. Page renders
// from a static TICKERS_INFO map (12 top dividend payers) plus best-
// effort fetch of real dividend history via assetsService. If the
// remote endpoint fails, the page still renders cleanly with the
// static info — no broken page for the crawler.
// ====================================================================

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

interface TickerInfo {
  fullName: string
  shortName: string
  type: 'STOCK' | 'REIT'
  sector: string
  payoutPattern: string
  typicalDY: string
  trackRecord: string
  answer: string
  howItWorks: string
  history: string
  nextEvents: string
  related: string[]
}

interface FaqItem {
  q: string
  a: string
}

const TICKERS_INFO: Record<string, TickerInfo> = {
  itub4: {
    fullName: 'Itaú Unibanco',
    shortName: 'Itaú',
    type: 'STOCK',
    sector: 'Bancos',
    payoutPattern: 'Trimestral via dividendos + JCP',
    typicalDY: '5-8% a.a.',
    trackRecord: '30+ anos pagando consistentemente',
    answer:
      'O Itaú Unibanco (ITUB4) paga dividendos e JCP trimestralmente, com DY histórico entre 5% e 8% ao ano. O banco mantém payout entre 50% e 60% do lucro líquido, combinando dividendos isentos de IR e JCP com 15% retido na fonte. ITUB4 é uma das ações mais consistentes da B3 em distribuição de proventos, com mais de 30 anos de histórico ininterrupto.',
    howItWorks:
      'O Itaú divulga resultados trimestrais (geralmente fevereiro, maio, agosto e novembro) e na sequência o conselho aprova o pagamento de proventos do trimestre. A política do banco prevê combinação de dividendos (parcela menor, isenta de IR) e JCP (parcela maior, com 15% retido na fonte) para otimizar a carga fiscal total. Pagamentos costumam sair 30 a 45 dias após o anúncio. Em anos de lucro elevado, o banco anuncia dividendos extraordinários no fim do ano, ampliando o DY anual realizado.',
    history:
      'Nos últimos 5 anos, o ITUB4 distribuiu em média R$ 2,50 a R$ 3,20 por ação ao ano em proventos totais (somando dividendos e JCP). Em 2024, distribuiu aproximadamente R$ 2,80 por ação. O DY ficou na faixa de 5% a 7% durante a maior parte do período, com picos de 8%+ em momentos de queda do preço da ação. O banco preserva política conservadora de payout, retendo parte do lucro para reforçar capital regulatório (Basileia).',
    nextEvents:
      'O Itaú costuma anunciar JCP intermediário ao longo do ano (março, junho, setembro) e dividendo complementar em dezembro/janeiro do exercício seguinte. Acompanhe os fatos relevantes no site de RI do banco e no calendário de dividendos da Redentia para datas exatas. Eventos extraordinários (lucro recorde, alteração na política de payout) podem trazer pagamentos adicionais.',
    related: ['itsa4', 'bbas3', 'bbdc4', 'bbse3'],
  },

  petr4: {
    fullName: 'Petrobras',
    shortName: 'Petrobras',
    type: 'STOCK',
    sector: 'Petróleo e gás',
    payoutPattern: 'Trimestral, baseado em geração de caixa',
    typicalDY: '8-25% a.a. (varia com petróleo)',
    trackRecord: 'Política de remuneração revisada em 2023',
    answer:
      'A Petrobras (PETR4) paga dividendos extraordinariamente robustos quando o preço do petróleo está alto, com DY que ultrapassou 30% em 2022-2023. Em 2024-2025, a política foi ajustada para distribuir 45% do fluxo de caixa livre menos investimentos quando dívida bruta está abaixo do limite. O DY típico em ciclos normais fica entre 8% e 15% ao ano, sempre vinculado ao preço do barril Brent e à capacidade de geração de caixa.',
    howItWorks:
      'A política atual da Petrobras (revista pelo Conselho em 2023) define remuneração trimestral equivalente a 45% do fluxo de caixa livre operacional menos investimentos, condicionada à dívida bruta abaixo de USD 65 bilhões. O resultado é distribuição alta em ciclos de preço de petróleo elevado e redução abrupta em ciclos de baixa. Pagamentos saem trimestralmente após divulgação dos resultados e aprovação do conselho. A empresa pode complementar com dividendos extraordinários em anos excepcionais, como ocorreu em 2022.',
    history:
      'PETR4 viveu três fases recentes: 2014-2019 com dividendos quase zero (Lava Jato + endividamento), 2020-2023 com pagamentos recordes (mais de R$ 250 bilhões distribuídos no ciclo) e 2024-2025 em normalização sob nova política. O DY anualizado em 2022 chegou a 38%, em 2023 ficou em torno de 18% e em 2024 retornou para faixa próxima a 12%. Sensibilidade ao preço do Brent e ao câmbio é o principal motor da distribuição.',
    nextEvents:
      'A Petrobras divulga resultados trimestrais nos meses de fevereiro/maio/agosto/novembro, com anúncio de remuneração na sequência. Acompanhe o cenário do preço do Brent e a posição de dívida bruta divulgada no release trimestral, ambos são determinantes para o tamanho do próximo dividendo. Mudança política na gestão também pode alterar a fórmula da política de remuneração.',
    related: ['vale3', 'bbas3', 'itub4', 'taee11'],
  },

  vale3: {
    fullName: 'Vale',
    shortName: 'Vale',
    type: 'STOCK',
    sector: 'Mineração',
    payoutPattern: 'Semestral, baseado em fluxo de caixa',
    typicalDY: '5-12% a.a. (varia com minério)',
    trackRecord: 'Maior pagadora de dividendos do Brasil em vários anos',
    answer:
      'A Vale (VALE3) paga dividendos semestralmente, com política mínima de 30% do EBITDA ajustado menos investimentos correntes. O DY histórico varia entre 5% e 12% ao ano, fortemente correlacionado ao preço do minério de ferro. Em 2021-2022, a empresa distribuiu mais de R$ 80 bilhões em dividendos e recompras. A Vale combina pagamentos regulares com extraordinários quando o caixa supera as metas de dívida líquida.',
    howItWorks:
      'A política atual define dividendo mínimo de 30% do EBITDA ajustado menos investimentos correntes, pago em duas parcelas anuais (geralmente março e setembro). Quando a dívida líquida fica abaixo de USD 10 bilhões, o conselho pode aprovar dividendos extraordinários ou programa de recompra de ações. Pagamentos saem em até 30 dias após a aprovação. A empresa também usa recompras como forma alternativa de devolver caixa aos acionistas.',
    history:
      'No ciclo 2020-2022, a Vale viveu boom histórico do minério de ferro e distribuiu mais de R$ 150 bilhões em proventos e recompras no agregado. Em 2023-2024, com queda do minério para USD 100-120/ton, a distribuição reduziu mas manteve DY em torno de 7% a 9%. A empresa também enfrenta passivos relacionados a Brumadinho e Mariana, fatores que impactam a capacidade de distribuição em anos específicos.',
    nextEvents:
      'A Vale divulga resultados semestrais em fevereiro e julho/agosto, com anúncio de dividendo na sequência. Acompanhe o preço da tonelada de minério (referência IODEX 62%) e a evolução da dívida líquida divulgada no release. Em anos de preço alto e dívida controlada, há histórico de dividendos extraordinários no segundo semestre.',
    related: ['petr4', 'bbas3', 'itub4', 'itsa4'],
  },

  itsa4: {
    fullName: 'Itaúsa',
    shortName: 'Itaúsa',
    type: 'STOCK',
    sector: 'Holding',
    payoutPattern: 'Mensal pequeno + dividendos trimestrais',
    typicalDY: '5-7% a.a.',
    trackRecord: 'Espelho do Itaú, pagamentos consistentes',
    answer:
      'A Itaúsa (ITSA4) é a holding que controla o Itaú Unibanco e outras empresas do grupo (Alpargatas, Dexco, Aegea). Paga dividendos mensais pequenos (centavos por ação) somados a dividendos trimestrais maiores, com DY total entre 5% e 7% ao ano. O preço da ITSA4 historicamente negocia com desconto de holding (10% a 25%) em relação ao valor justo das participações, o que pode amplificar o DY relativo ao preço.',
    howItWorks:
      'A Itaúsa recebe dividendos do Itaú Unibanco (sua principal participação) e das outras controladas, e repassa aos acionistas no mesmo padrão. A holding tem política de pagar dividendos mensais simbólicos (R$ 0,01 a R$ 0,02 por ação) que somam contribuição relevante ao longo do ano. Trimestralmente, anuncia dividendos maiores correspondentes ao recebimento de proventos das controladas. Pagamentos saem em até 30 dias após o anúncio.',
    history:
      'Nos últimos 5 anos, a ITSA4 distribuiu em média R$ 0,90 a R$ 1,10 por ação ao ano em proventos totais. O DY ficou na faixa de 5% a 7%, com leve prêmio em relação ao próprio Itaú em momentos de desconto de holding mais elevado. A empresa também faz emissão eventual de bonificações em ações, ampliando a posição do investidor sem custo adicional.',
    nextEvents:
      'A Itaúsa segue o calendário de pagamentos do Itaú Unibanco, com anúncios trimestrais (março, junho, setembro, dezembro) e pagamentos mensais simbólicos contínuos. Em anos de lucro recorde do Itaú, a Itaúsa replica os pagamentos extraordinários, sendo opção popular para quem quer exposição indireta ao Itaú com possível arbitragem de desconto de holding.',
    related: ['itub4', 'bbas3', 'bbdc4', 'bbse3'],
  },

  bbas3: {
    fullName: 'Banco do Brasil',
    shortName: 'Banco do Brasil',
    type: 'STOCK',
    sector: 'Bancos',
    payoutPattern: 'JCP trimestral + dividendos',
    typicalDY: '7-11% a.a.',
    trackRecord: 'Payout estável de 30-40%',
    answer:
      'O Banco do Brasil (BBAS3) paga JCP trimestralmente e dividendos complementares no fim do ano, com DY entre 7% e 11% ao ano nos últimos exercícios. O payout fica estável em torno de 30% a 40% do lucro líquido, com tendência de elevação em anos de lucro forte. BBAS3 é apontado como a ação de banco com maior DY entre as grandes da B3, refletindo desconto de governança (controle estatal) já precificado.',
    howItWorks:
      'O Banco do Brasil distribui proventos trimestralmente após divulgação dos resultados (fevereiro, maio, agosto, novembro). A maior parte vem como JCP (com 15% retido na fonte), pagamento que reduz a carga tributária do banco. Em dezembro, costuma haver anúncio de dividendo complementar referente ao exercício, com data-com no fim do ano e pagamento em janeiro/fevereiro do exercício seguinte. Pagamentos costumam sair em 30 a 45 dias após a aprovação.',
    history:
      'Nos últimos 5 anos, o BBAS3 distribuiu em média R$ 4,50 a R$ 6,00 por ação ao ano em proventos totais. O DY se manteve consistentemente acima de 7%, com picos próximos a 12% em momentos de pessimismo do mercado quanto ao controle estatal. Em 2023-2024, o banco bateu recordes de lucro, ampliando o pagamento total.',
    nextEvents:
      'O Banco do Brasil divulga resultados trimestrais nos meses tradicionais (fevereiro, maio, agosto, novembro) e anuncia JCP em sequência. O dividendo complementar de fim de ano é anunciado em dezembro, com pagamento em janeiro ou fevereiro do exercício seguinte. Acompanhe o ROE do banco e o cenário macro (Selic e inadimplência) para projetar os próximos pagamentos.',
    related: ['itub4', 'itsa4', 'bbdc4', 'bbse3'],
  },

  bbdc4: {
    fullName: 'Bradesco',
    shortName: 'Bradesco',
    type: 'STOCK',
    sector: 'Bancos',
    payoutPattern: 'JCP mensal + dividendos extraordinários',
    typicalDY: '4-7% a.a.',
    trackRecord: 'Tradição de JCP mensal pequeno',
    answer:
      'O Bradesco (BBDC4) é tradicional pelo pagamento de JCP mensal pequeno (alguns centavos por ação), somado a dividendos complementares no fim do ano. O DY total fica entre 4% e 7% ao ano, abaixo de pares como ITUB4 e BBAS3 em alguns períodos. A política de pagamento mensal facilita planejamento de renda passiva, mas exige reinvestimento ativo dado o valor pequeno de cada parcela.',
    howItWorks:
      'O Bradesco anuncia JCP mensal todo início de mês, com pagamento até o final do mesmo mês. Os valores costumam ficar entre R$ 0,01 e R$ 0,04 por ação por mês. Adicionalmente, o conselho aprova dividendos complementares em momentos pontuais (geralmente fim do exercício), com pagamento maior em parcela única. JCP carrega 15% de IR retido na fonte; dividendos são isentos para pessoa física.',
    history:
      'Nos últimos 5 anos, o BBDC4 distribuiu em média R$ 1,10 a R$ 1,40 por ação ao ano em proventos totais. O DY ficou na faixa de 4% a 7%, com momentos de desconto de avaliação que ampliaram o DY relativo. O banco passou por reestruturação operacional em 2023-2024, impactando o nível de distribuição em comparação com pares.',
    nextEvents:
      'O Bradesco mantém calendário previsível de JCP mensal anunciado no primeiro dia útil do mês. Dividendos complementares são anunciados após divulgação dos resultados trimestrais (especialmente o do quarto trimestre). Acompanhe a recuperação do ROE do banco para projetar normalização da política de payout em anos vindouros.',
    related: ['itub4', 'bbas3', 'itsa4', 'bbse3'],
  },

  bbse3: {
    fullName: 'BB Seguridade',
    shortName: 'BB Seguridade',
    type: 'STOCK',
    sector: 'Seguros',
    payoutPattern: 'Semestral, payout 90%+',
    typicalDY: '7-10% a.a.',
    trackRecord: 'Payout altíssimo desde IPO em 2013',
    answer:
      'A BB Seguridade (BBSE3) é a holding de seguros do Banco do Brasil e mantém política de pagamento de quase 100% do lucro líquido (payout próximo de 95%). Paga proventos semestralmente, com DY entre 7% e 10% ao ano. Por ser empresa de seguros (negócio de capital leve), tem baixa necessidade de retenção de lucro, o que viabiliza payout altíssimo de forma sustentável.',
    howItWorks:
      'A BB Seguridade distribui proventos em duas parcelas anuais (geralmente fevereiro e agosto), referentes aos semestres anteriores. A combinação é majoritariamente dividendos (isentos de IR) com pequena parcela de JCP. Pagamentos saem em até 30 dias após a aprovação. A empresa usa pouca dívida e não tem necessidade de capex relevante, o que sustenta o payout elevado.',
    history:
      'Desde o IPO em 2013, a BBSE3 distribuiu mais de R$ 50 bilhões em proventos. Nos últimos 5 anos, manteve DY consistentemente acima de 7%, com picos de 10%+ em momentos de queda do preço da ação. Em 2024, o pagamento total ficou próximo de R$ 4,00 por ação. A empresa atravessou bem o período de pandemia, mantendo a política mesmo em ano de lucro reduzido.',
    nextEvents:
      'A BBSE3 divulga resultados semestrais em fevereiro e agosto, com anúncio de dividendo na sequência. Acompanhe a sinistralidade do mercado segurador e o desempenho dos produtos vendidos via rede do Banco do Brasil. Em anos de baixa sinistralidade, o lucro tende a ser maior, ampliando o pagamento total.',
    related: ['bbas3', 'itub4', 'itsa4', 'taee11'],
  },

  taee11: {
    fullName: 'Taesa',
    shortName: 'Taesa',
    type: 'STOCK',
    sector: 'Energia (transmissão)',
    payoutPattern: 'Semestral, payout 95%+',
    typicalDY: '8-12% a.a.',
    trackRecord: 'Maior pagadora histórica do setor de transmissão',
    answer:
      'A Taesa (TAEE11) é uma das maiores transmissoras de energia do Brasil e mantém política de payout de no mínimo 90% do lucro líquido (frequentemente 100%). Paga proventos semestralmente, com DY entre 8% e 12% ao ano, um dos mais altos da B3. Receita previsível por contratos de concessão de longo prazo (RAP, Receita Anual Permitida) viabiliza distribuição estável e elevada por décadas.',
    howItWorks:
      'A Taesa distribui proventos em duas parcelas anuais (geralmente abril e outubro), correspondentes aos semestres anteriores. O pagamento é majoritariamente em dividendos (isentos de IR), com pequena parcela em JCP em alguns períodos. A receita das transmissoras é regulada pela ANEEL (RAP, reajustada por IGP-M ou IPCA) e indexada à inflação, o que torna o fluxo de caixa altamente previsível.',
    history:
      'Nos últimos 5 anos, a TAEE11 distribuiu em média R$ 3,00 a R$ 4,00 por unit ao ano em proventos. O DY ficou consistentemente acima de 8%, com picos próximos a 14% em momentos de queda do preço por aversão ao setor de utilities. A unit (TAEE11) é composta por uma ação ON e duas PN, equivalente operacional do empacotamento.',
    nextEvents:
      'A Taesa anuncia proventos em sequência aos resultados semestrais (geralmente abril e outubro). Acompanhe a evolução dos investimentos em novas linhas de transmissão (capex em leilões da ANEEL), pois exigências de capex acima do esperado podem reduzir temporariamente o payout. Empresa também emite reforços de capital por acionistas em anos de maior expansão.',
    related: ['bbse3', 'bbas3', 'itub4', 'itsa4'],
  },

  abev3: {
    fullName: 'Ambev',
    shortName: 'Ambev',
    type: 'STOCK',
    sector: 'Bebidas',
    payoutPattern: 'Semestral, dividendos + JCP',
    typicalDY: '4-7% a.a.',
    trackRecord: 'Defensiva clássica, payout 60-80%',
    answer:
      'A Ambev (ABEV3) é referência defensiva da B3 em consumo básico, com política de payout entre 60% e 80% do lucro líquido. Paga proventos semestralmente, combinando dividendos e JCP, com DY entre 4% e 7% ao ano. Por operar em mercado maduro de bebidas, tem geração de caixa estável e baixa necessidade de capex de expansão, sustentando distribuição contínua mesmo em ciclos econômicos adversos.',
    howItWorks:
      'A Ambev distribui proventos semestralmente (abril e setembro/outubro), combinando dividendos (isentos de IR) e JCP (15% retidos). A empresa publica calendário de pagamentos junto com a divulgação dos resultados anuais. Pagamentos costumam sair em 30 a 45 dias após a aprovação. A política se ajusta à geração de caixa e ao programa de recompras de ações que a empresa mantém em paralelo.',
    history:
      'Nos últimos 5 anos, a ABEV3 distribuiu em média R$ 0,60 a R$ 0,80 por ação ao ano em proventos totais. O DY ficou na faixa de 4% a 7%, com momentos de prêmio em períodos de queda do preço por preocupações com volume de venda de cervejas. A empresa também mantém programa contínuo de recompra de ações, devolvendo capital adicional aos acionistas remanescentes.',
    nextEvents:
      'A Ambev divulga resultados trimestrais em fevereiro/maio/agosto/novembro e anuncia proventos relevantes em parcelas semestrais (junto com resultado anual e do segundo trimestre). Acompanhe volume de cervejas, mix de marcas premium e câmbio (custos em dólar) para projetar a próxima distribuição. Empresa segue diretrizes da AB InBev (controladora global) em parte da política.',
    related: ['itub4', 'itsa4', 'bbas3', 'bbse3'],
  },

  mxrf11: {
    fullName: 'Maxi Renda FII',
    shortName: 'Maxi Renda',
    type: 'REIT',
    sector: 'FII de Papel',
    payoutPattern: 'Mensal, distribuição obrigatória',
    typicalDY: '11-14% a.a.',
    trackRecord: 'Maior FII de papel em número de cotistas',
    answer:
      'O Maxi Renda (MXRF11) é o FII mais popular do Brasil em número de cotistas (mais de 1 milhão), focado em CRIs (Certificados de Recebíveis Imobiliários) e dívida imobiliária. Paga rendimentos mensais com DY entre 11% e 14% ao ano. Cota negociada na faixa de R$ 9-11 facilita acesso para pequenos investidores. Distribuição majoritariamente isenta de IR para pessoa física, padrão do segmento de FIIs.',
    howItWorks:
      'O MXRF11 anuncia o rendimento mensal sempre no primeiro dia útil do mês, com data-com tipicamente no dia 31 e pagamento até o dia 15 do mês seguinte. Os rendimentos vêm dos juros pagos pelos CRIs em carteira, indexados majoritariamente a IPCA + spread fixo. A gestão é da XP Asset, que faz a seleção dos papéis e a diversificação por emissor e setor.',
    history:
      'Nos últimos 5 anos, o MXRF11 distribuiu em média R$ 0,10 a R$ 0,12 por cota por mês, equivalente a R$ 1,20 a R$ 1,44 por cota ao ano. O DY anualizado ficou consistentemente entre 11% e 14%, com picos em períodos de IPCA elevado. Cota patrimonial (P/VP) costuma rodar próximo de 1,00, com pequenas variações que afetam o preço de mercado.',
    nextEvents:
      'O MXRF11 anuncia distribuição mensal previsível no primeiro dia útil de cada mês. Acompanhe a variação do IPCA (principal indexador da carteira) e a evolução de eventuais inadimplências em CRIs específicos divulgadas no relatório gerencial mensal. Mudanças tributárias (PL 1.087/2025 propõe taxar dividendos > R$ 50k/mês, mas FIIs continuam isentos no texto atual) também podem impactar o segmento.',
    related: ['kncr11', 'hglg11'],
  },

  kncr11: {
    fullName: 'Kinea Rendimentos FII',
    shortName: 'Kinea Rendimentos',
    type: 'REIT',
    sector: 'FII de Papel (CDI)',
    payoutPattern: 'Mensal, distribuição obrigatória',
    typicalDY: '12-15% a.a.',
    trackRecord: 'Maior FII de papel CDI da Kinea',
    answer:
      'O Kinea Rendimentos (KNCR11) é um FII de papel da Kinea Investimentos focado em CRIs indexados ao CDI. Paga rendimentos mensais com DY entre 12% e 15% ao ano em ciclo de Selic alta (como 2024-2025). Por ser pós-fixado em CDI, é defensivo em ciclos de juros altos, mas perde atratividade em ciclos de Selic em queda. Ideal para investidor que quer renda mensal com volatilidade baixa de cota.',
    howItWorks:
      'O KNCR11 anuncia distribuição mensal no primeiro dia útil do mês, com pagamento até o dia 15. Os rendimentos vêm dos juros pagos pelos CRIs indexados a CDI + spread, refletindo diretamente o nível da Selic vigente. A gestão é da Kinea (Itaú), com carteira diversificada entre múltiplos emissores e setores imobiliários (residencial, logístico, corporativo).',
    history:
      'Nos últimos 5 anos, o KNCR11 distribuiu rendimentos que variaram entre R$ 0,80 e R$ 1,30 por cota por mês, acompanhando o ciclo da Selic. Com Selic em 13,75% (ciclo 2022-2023), o DY anualizado superou 14%. Em ciclos de Selic mais baixa (2020-2021 com Selic em 2-4,5%), o DY caiu para faixa de 7-9%. A volatilidade de cota historicamente é baixa, refletindo a marcação a mercado dos CRIs.',
    nextEvents:
      'O KNCR11 anuncia distribuição mensal previsível no primeiro dia útil. Acompanhe a trajetória da Selic (decisões do COPOM a cada 45 dias) e a evolução de eventuais inadimplências divulgadas no relatório gerencial mensal. Em ciclos de queda da Selic, considere migrar parte da exposição para FIIs indexados a IPCA (preserva poder de compra real).',
    related: ['mxrf11', 'hglg11'],
  },

  hglg11: {
    fullName: 'CSHG Logística FII',
    shortName: 'CSHG Logística',
    type: 'REIT',
    sector: 'FII Logística',
    payoutPattern: 'Mensal, distribuição obrigatória',
    typicalDY: '7-9% a.a.',
    trackRecord: 'Pioneiro em FIIs de galpões logísticos',
    answer:
      'O CSHG Logística (HGLG11) é um dos maiores FIIs de galpões logísticos do Brasil, com mais de 60 imóveis e R$ 4 bilhões em patrimônio. Paga rendimentos mensais com DY entre 7% e 9% ao ano. Carteira atende grandes operadores como Mercado Livre, Magazine Luiza, Amazon e transportadoras, com contratos longos atípicos (5-10 anos) que dão previsibilidade ao fluxo. Vacância historicamente baixa, abaixo de 5%.',
    howItWorks:
      'O HGLG11 anuncia distribuição mensal no primeiro dia útil do mês, com pagamento até o dia 15. Os rendimentos vêm dos aluguéis pagos pelos inquilinos dos galpões, reajustados anualmente por IGP-M ou IPCA. A gestão é da CSHG (Credit Suisse Hedging-Griffo), com histórico de aquisições estratégicas em mercados de logística próximos a grandes centros consumidores. Pagamentos têm previsibilidade alta dada a estabilidade dos contratos.',
    history:
      'Nos últimos 5 anos, o HGLG11 distribuiu rendimentos médios entre R$ 1,00 e R$ 1,15 por cota por mês, equivalente a R$ 12 a R$ 14 por cota ao ano. O DY anualizado ficou na faixa de 7% a 9%, com momentos de prêmio em períodos de queda da cota (durante alta de juros). P/VP costuma rodar entre 0,90 e 1,10. A estratégia de boom do e-commerce no Brasil sustentou expansão de demanda por galpões logísticos.',
    nextEvents:
      'O HGLG11 anuncia distribuição mensal previsível no primeiro dia útil. Acompanhe os relatórios mensais do gestor para evolução de novas aquisições, vacância (atualmente baixa) e inadimplência. Renovações de contrato com inquilinos âncora (Mercado Livre, Magazine Luiza) são eventos relevantes que podem impactar projeções de receita futura.',
    related: ['mxrf11', 'kncr11'],
  },
}

// ====================================================================
// Route + lookup
// ====================================================================

const route = useRoute()
const slug = computed(() => String(route.params.ticker || '').toLowerCase())
const ticker = computed(() => slug.value.toUpperCase())

const info = computed<TickerInfo>(() => {
  const found = TICKERS_INFO[slug.value]
  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Ticker não encontrado' })
  }
  return found
})

const brand = useBrand()
const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'static',
)

// ====================================================================
// FAQ — built per ticker
// ====================================================================

const faqItems = computed<FaqItem[]>(() => [
  {
    q: `Quando o ${ticker.value} paga dividendos?`,
    a: `O ${ticker.value} (${info.value.fullName}) paga proventos com periodicidade ${info.value.payoutPattern.toLowerCase()}. ${
      info.value.type === 'REIT'
        ? 'Como é um FII, distribui rendimentos mensais por obrigação legal (mínimo 95% do lucro semestral).'
        : 'Acompanhe o calendário oficial no site de RI da empresa ou no calendário de dividendos da Redentia para datas exatas dos próximos pagamentos.'
    }`,
  },
  {
    q: `Quanto o ${ticker.value} pagou em dividendos no último ano?`,
    a: `${info.value.history} Para valores exatos do último exercício, consulte o histórico completo na página do ativo ou os relatórios anuais da empresa.`,
  },
  {
    q: `Vale a pena comprar ${ticker.value} pelos dividendos?`,
    a: `O DY típico do ${ticker.value} fica em ${info.value.typicalDY}, ${info.value.trackRecord.toLowerCase()}. ${
      info.value.type === 'REIT'
        ? 'Para FIIs, considere também a qualidade dos imóveis ou ativos em carteira, vacância (no caso de tijolo) e indexador da receita (CDI ou IPCA).'
        : 'Para ações, considere também a sustentabilidade do payout, ciclo do setor e múltiplos atuais de avaliação. DY alto isolado pode ser sinal de queda do preço, não necessariamente de qualidade.'
    }`,
  },
  {
    q: `Os dividendos do ${ticker.value} são isentos de IR?`,
    a: info.value.type === 'REIT'
      ? `Sim. Rendimentos de FIIs são isentos de IR para pessoa física, desde que o investidor não detenha mais de 10% das cotas e o FII tenha pelo menos 50 cotistas. O ${ticker.value} cumpre esses requisitos. O PL 1.087/2025 propõe taxar dividendos > R$ 50k/mês, mas mantém FIIs isentos no texto atual.`
      : `Dividendos do ${ticker.value} são isentos de IR para pessoa física pela legislação atual. JCP (parcela frequente em ações brasileiras) tem 15% retido na fonte. O PL 1.087/2025 propõe taxar dividendos acima de R$ 50 mil por mês em 10% retidos na fonte, mas ainda está em apreciação no Senado e não vigora.`,
  },
  {
    q: `Onde acompanhar os anúncios de dividendos do ${ticker.value}?`,
    a: `Os anúncios oficiais saem como Fato Relevante no site de RI da empresa e no sistema da CVM. A Redentia mantém calendário consolidado de todos os pagamentos da B3 (ações e FIIs) atualizado diariamente, com alertas opcionais por ticker para usuários cadastrados. Acompanhe também o calendário visual em /dividendos/calendario.`,
  },
])

// ====================================================================
// Data fetching — best effort, page renders ok mesmo se falhar
// ====================================================================

const service = useAssetsService()

interface DividendRecord {
  rate: number | string
  payment_date: string
  last_date_prior: string | null
  label: string
  type?: string
}

const { data: dividendsData, pending } = await useAsyncData<DividendRecord[] | null>(
  `dividends-${slug.value}`,
  async () => {
    try {
      const data = await service.getTickerDividends(slug.value)
      // Tolerate both shapes: array directly or { results: [...] }
      if (Array.isArray(data)) return data as DividendRecord[]
      if (data && typeof data === 'object' && Array.isArray((data as any).results)) {
        return (data as any).results as DividendRecord[]
      }
      return null
    } catch {
      return null
    }
  },
  { default: () => null },
)

const recentDividends = computed<DividendRecord[]>(() => {
  const list = dividendsData.value
  if (!list || !Array.isArray(list) || list.length === 0) return []
  // Sort by payment_date desc, take 12 most recent
  return [...list]
    .filter((d) => d && d.payment_date)
    .sort((a, b) => (b.payment_date || '').localeCompare(a.payment_date || ''))
    .slice(0, 12)
})

const lastDividend = computed<DividendRecord | null>(() => {
  return recentDividends.value[0] || null
})

// ====================================================================
// Info cards
// ====================================================================

const infoCards = computed(() => [
  { label: 'Setor', value: info.value.sector },
  { label: 'Tipo de pagamento', value: info.value.payoutPattern },
  { label: 'DY típico', value: info.value.typicalDY },
  { label: 'Track record', value: info.value.trackRecord },
])

// ====================================================================
// Related tickers
// ====================================================================

const relatedTickers = computed(() =>
  info.value.related
    .map((relSlug) => {
      const relInfo = TICKERS_INFO[relSlug]
      if (!relInfo) return null
      return { ticker: relSlug.toUpperCase(), name: relInfo.fullName }
    })
    .filter((x): x is { ticker: string; name: string } => !!x),
)

// ====================================================================
// Helpers
// ====================================================================

function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function formatRate(value: number | string): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return '-'
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  })
}

function getLabelColor(label: string): string {
  const norm = (label || '').toUpperCase()
  if (norm.includes('JCP') || norm.includes('JUROS')) {
    return 'var(--brand-warning)'
  }
  if (norm.includes('BONIF')) {
    return 'var(--brand-secondary)'
  }
  return 'var(--brand-positive)'
}

// ====================================================================
// SEO
// ====================================================================

const CONTENT_VERSION = '2026-05-05'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

// Title sob 60 chars: "Dividendos {TICKER}: Pagamentos 2026 | Redentia"
const pageTitle = computed(
  () => `Dividendos ${ticker.value}: Pagamentos 2026 | ${brand.name}`,
)

const pageDescription = computed(() => {
  const i = info.value
  return `Dividendos ${ticker.value} (${i.fullName}): ${i.payoutPattern.toLowerCase()}, DY típico ${i.typicalDY}. Histórico, próximos pagamentos e calendário B3.`
})

const itemListEntries = computed(() =>
  recentDividends.value.map((item, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: `${item.label} ${ticker.value} ${formatDateShort(item.payment_date)}`,
    description: `Pagamento de R$ ${formatRate(item.rate)} em ${formatDateShort(item.payment_date)}`,
  })),
)

usePageSeo({
  title: pageTitle,
  description: pageDescription,
  path: `/dividendos/${slug.value}`,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Dividendos', path: '/dividendos' },
    { name: 'Calendário', path: '/dividendos/calendario' },
    { name: ticker.value, path: `/dividendos/${slug.value}` },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `Dividendos ${ticker.value} - ${brand.name}`,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Histórico de proventos',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      description: pageDescription.value,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.value.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    ...(itemListEntries.value.length > 0
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `Últimos pagamentos de dividendos do ${ticker.value}`,
            itemListElement: itemListEntries.value,
          },
        ]
      : []),
  ],
})

useHead({
  link: [{ rel: 'prev', href: '/dividendos/calendario' }],
})
</script>

<!--
  /ranking/[slug] — Dynamic SEO landing page for the 17 fundamentalist
  rankings powered by the new RankingController endpoints.

  Each slug resolves to a typed RankingConfig in RANKINGS_INFO. Unknown
  slugs throw a 404. The page renders:
    - Hero (back-link, eyebrow, icon, H1, subtitle)
    - Trust badges row
    - Type filter tabs (Todos / Ações / FIIs / ETFs)
    - RankingTable with the configured columns
    - Educational content (~600-800 words, H2 sections)
    - Cross-links to relevant calculators + /ranking
    - FAQ specific to this ranking
    - CTA (criar conta + ver outros rankings)

  Schemas: WebApplication + FAQPage + ItemList. NO aggregateRating,
  HowTo or Article — those are intentionally excluded per the SEO
  ruleset for these pages.
-->
<template>
  <NuxtLayout name="default" :title="config.h1">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- ============ Hero ============ -->
      <MoleculesPageHeader
        :back-link="{ to: '/ranking', label: 'Todos os rankings' }"
        :icon="config.icon"
        icon-style="circle"
        :icon-color="config.iconColor"
        eyebrow="Ranking"
        :title="config.h1"
        :description="config.subtitle"
      />

      <!-- ============ Trust badges ============ -->
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs" :style="{ color: 'var(--brand-text-muted)' }">
        <span
          v-for="(badge, idx) in config.badges"
          :key="badge.text"
          class="flex items-center gap-1"
        >
          <UIcon
            :name="badge.icon"
            class="size-4"
            :style="{ color: 'var(--brand-primary)' }"
          />
          {{ badge.text }}
          <span v-if="idx < config.badges.length - 1" class="ml-1">·</span>
        </span>
      </div>

      <!-- ============ Type filter tabs ============ -->
      <AtomsSegmented
        v-model="activeType"
        :options="tabs"
        aria-label="Filtrar tipo de ativo"
      />

      <!-- ============ Table ============ -->
      <div v-if="pending" class="flex items-center justify-center py-16">
        <UIcon name="i-lucide-loader" class="size-6 motion-safe:animate-spin" />
      </div>
      <MoleculesRankingTable
        v-else
        :rows="rows || []"
        :columns="config.columns"
        :change-label="config.changeLabel || 'Hoje'"
      />

      <!-- ============ Educational content ============ -->
      <article
        class="mt-8 flex flex-col gap-6 border-t pt-8"
        :style="{ borderColor: 'var(--brand-border)' }"
      >
        <template
          v-for="(section, idx) in config.educationalSections"
          :key="`section-${idx}`"
        >
          <h2
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(22px, 2.5vw, 26px)',
              lineHeight: 1.2,
              letterSpacing: '-0.4px',
            }"
          >{{ section.h2 }}</h2>
          <p
            v-for="(para, pIdx) in section.paragraphs"
            :key="`p-${idx}-${pIdx}`"
            class="leading-relaxed"
            :style="{ color: 'var(--brand-text-muted)' }"
          >{{ para }}</p>
        </template>
      </article>

      <!-- ============ Cross-links to calculators + outros rankings ============ -->
      <section class="flex flex-col gap-4">
        <h2
          class="font-light"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(22px, 2.5vw, 26px)',
            lineHeight: 1.2,
            letterSpacing: '-0.4px',
          }"
        >Ferramentas relacionadas</h2>
        <div class="grid gap-3 md:grid-cols-2">
          <NuxtLink
            v-for="link in config.crossLinks"
            :key="link.to"
            :to="link.to"
            class="group flex items-center gap-4 rounded-xl border p-4 transition hover:border-secondary/50"
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
            <div class="flex flex-col gap-0.5">
              <span class="text-sm font-medium" :style="{ color: 'var(--brand-text)' }">
                {{ link.title }}
              </span>
              <span class="text-xs" :style="{ color: 'var(--brand-text-muted)' }">
                {{ link.sub }}
              </span>
            </div>
            <UIcon
              name="i-lucide-arrow-right"
              class="ml-auto size-4 shrink-0 transition group-hover:translate-x-0.5"
              :style="{ color: 'var(--brand-text-muted)' }"
            />
          </NuxtLink>
        </div>
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
        >Perguntas Frequentes</h2>

        <div class="flex flex-col gap-3">
          <details
            v-for="faq in config.faqItems"
            :key="faq.q"
            class="group rounded-xl border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-medium"
              :style="{ color: 'var(--brand-text)' }"
            >
              {{ faq.q }}
              <UIcon
                name="i-lucide-chevron-down"
                class="size-5 transition-transform group-open:rotate-180"
              />
            </summary>
            <p class="mt-3 text-sm leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
              {{ faq.a }}
            </p>
          </details>
        </div>
      </section>

      <!-- ============ CTA ============ -->
      <MoleculesCtaSection
        :title="`Acompanhe ${config.title.toLowerCase()} na sua carteira`"
        :description="`Cadastre-se na ${brand.name} e receba alertas automáticos sobre os ativos do ranking, com indicadores fundamentalistas atualizados diariamente.`"
        :buttons="[
          { label: 'Criar conta grátis', to: '/auth/register', icon: 'i-lucide-arrow-right', variant: 'primary' },
          { label: 'Ver outros rankings', to: '/ranking', variant: 'outline' },
        ]"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
// ====================================================================
// /ranking/[slug] — typed dispatch table for the 17 fundamentalist
// rankings. Each entry owns: copy (h1, subtitle, meta), behaviour
// (icon, columns, fetcher) and SEO (faqItems, educational content).
//
// To add a new ranking: drop a new entry in RANKINGS_INFO. Sitemap
// entries live in nuxt.config.ts (sitemap.urls()) and need to be kept
// in sync manually — they are not auto-derived from this map because
// nuxt.config runs at build time and can't import from /pages.
// ====================================================================

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})


// ----- Types ---------------------------------------------------------

type TickerType = 'STOCK' | 'REIT' | 'ETF' | 'BDR' | null

type RankingColumn =
  | 'dy'
  | 'pe'
  | 'change'
  | 'marketCap'
  | 'roe'
  | 'netMargin'
  | 'revenue'
  | 'netIncome'
  | 'cash'
  | 'grahamPrice'
  | 'bazinPrice'
  | 'upsidePct'
  | 'buyHoldScore'

type FetcherFn = (
  service: ReturnType<typeof useAssetsService>,
  type: TickerType,
) => Promise<any[]>

interface FaqItem {
  q: string
  a: string
}

interface BadgeItem {
  icon: string
  text: string
}

interface CrossLink {
  to: string
  icon: string
  title: string
  sub: string
}

interface EducationalSection {
  h2: string
  paragraphs: string[]
}

interface RankingConfig {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  h1: string
  subtitle: string
  icon: string
  iconColor: 'primary' | 'positive' | 'negative'
  badges: BadgeItem[]
  columns: RankingColumn[]
  changeLabel?: string
  fetcher: FetcherFn
  educationalSections: EducationalSection[]
  crossLinks: CrossLink[]
  faqItems: FaqItem[]
}

// ----- Shared cross-links --------------------------------------------

// Repeated verbatim — every page should link back to /ranking. Pulled
// out so the entries stay readable.
const linkOutrosRankings: CrossLink = {
  to: '/ranking',
  icon: 'i-lucide-list',
  title: 'Outros rankings',
  sub: 'Veja todos os rankings disponíveis na Redentia.',
}

const linkPrecoTeto: CrossLink = {
  to: '/calculadora/preco-teto',
  icon: 'i-lucide-calculator',
  title: 'Calculadora de Preço Teto',
  sub: 'Calcule o preço justo de uma ação por Graham e Bazin.',
}

const linkDividendYield: CrossLink = {
  to: '/calculadora/dividend-yield',
  icon: 'i-lucide-coins',
  title: 'Calculadora de Dividend Yield',
  sub: 'Simule o DY real de qualquer ação ou FII.',
}

const linkSimuladorAcoes: CrossLink = {
  to: '/calculadora/acoes',
  icon: 'i-lucide-line-chart',
  title: 'Simulador de Ações',
  sub: 'Projete retorno total de uma carteira ao longo do tempo.',
}

// ----- RANKINGS_INFO ------------------------------------------------

const RANKINGS_INFO: Record<string, RankingConfig> = {

  // ============================================================
  // 1. Maiores Valor de Mercado
  // ============================================================
  'maiores-valor-mercado': {
    slug: 'maiores-valor-mercado',
    title: 'Maiores Valor de Mercado',
    metaTitle: 'Maiores Valor de Mercado da B3 2026 | Redentia',
    metaDescription:
      'Top 50 maiores empresas por valor de mercado da bolsa brasileira: Petrobras, Vale, Itaú, Ambev, Bradesco. Atualizado diariamente com cotação e indicadores.',
    h1: 'Maiores Empresas por Valor de Mercado',
    subtitle:
      'As 50 maiores empresas listadas na B3 ordenadas por capitalização de mercado, com Petrobras, Vale, Itaú, Bradesco e blue chips brasileiras. Atualizado diariamente após pregão.',
    icon: 'i-lucide-building-2',
    iconColor: 'primary',
    badges: [
      { icon: 'i-lucide-refresh-cw', text: 'Atualizado diariamente' },
      { icon: 'i-lucide-database', text: 'Dados B3' },
      { icon: 'i-lucide-trophy', text: 'Top 50' },
      { icon: 'i-lucide-globe', text: 'Blue chips' },
    ],
    columns: ['marketCap', 'change', 'dy', 'pe'],
    fetcher: (service, type) => service.getTopMarketCap(type, 50),
    educationalSections: [
      {
        h2: 'O que é Valor de Mercado (Market Cap)?',
        paragraphs: [
          'Valor de mercado, ou market cap, é o valor total que o mercado atribui a uma empresa listada na bolsa. A conta é simples: preço atual da ação multiplicado pela quantidade total de ações em circulação. Uma empresa com 1 bilhão de ações cotadas a R$ 30 tem valor de mercado de R$ 30 bilhões.',
          'O market cap é o jeito mais rápido de comparar o tamanho de empresas listadas e definir em qual segmento elas se encaixam. No Brasil, blue chips são as empresas com market cap acima de R$ 50 bilhões (Petrobras, Vale, Itaú, Ambev, Bradesco), mid caps ficam entre R$ 5 bilhões e R$ 50 bilhões, e small caps abaixo de R$ 5 bilhões.',
        ],
      },
      {
        h2: 'Como interpretar o ranking',
        paragraphs: [
          'Empresas no topo do ranking tendem a ser mais líquidas (volume de negociação alto), com cobertura mais ampla de analistas e menos volatilidade que small caps. Isso facilita entrada e saída sem mexer muito no preço, vantagem importante pra quem trabalha com posições maiores.',
          'Por outro lado, blue chips raramente entregam crescimento explosivo. Um banco que vale R$ 300 bilhões precisa criar muito valor pra dobrar de tamanho, enquanto uma small cap de R$ 1 bilhão pode dobrar com uma única boa execução. Isso se reflete em retornos esperados: blue chips são previsíveis, small caps oscilam mais.',
        ],
      },
      {
        h2: 'Limitações do market cap como métrica única',
        paragraphs: [
          'O market cap mostra tamanho, não qualidade. Uma empresa pode ser gigantesca e ainda assim ter resultado operacional ruim (margem comprimida, dívida alta, ROE baixo). Por isso, sempre cruze esse ranking com indicadores fundamentalistas: P/L, dividend yield, ROE e margem líquida (todos exibidos nas outras páginas de ranking).',
          'Outra limitação: o market cap não captura o valor da empresa do ponto de vista de quem compra a empresa inteira. Pra essa análise, use o EV (Enterprise Value), que soma a dívida líquida ao market cap. Empresas muito alavancadas tem EV bem maior que market cap, sinal de risco escondido.',
        ],
      },
    ],
    crossLinks: [
      linkPrecoTeto,
      linkDividendYield,
      linkSimuladorAcoes,
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'Qual é a maior empresa da bolsa brasileira em valor de mercado?',
        a: 'Em 2026, as três maiores empresas por market cap na B3 alternam entre Petrobras (PETR4), Vale (VALE3) e Itaú Unibanco (ITUB4), com valor de mercado tipicamente acima de R$ 400 bilhões cada uma. A ordenação varia conforme o preço do petróleo (Petrobras), do minério de ferro (Vale) e os resultados trimestrais dos bancos.',
      },
      {
        q: 'O que é blue chip e como diferenciar de small cap?',
        a: 'Blue chip é uma empresa grande, líquida e com resultado consolidado, geralmente com market cap acima de R$ 50 bilhões. Small cap tem market cap abaixo de R$ 5 bilhões e tende a ser mais volátil, menos líquida e com cobertura limitada de analistas. Mid caps ficam entre os dois, R$ 5-50 bilhões.',
      },
      {
        q: 'Vale a pena investir só nas maiores empresas?',
        a: 'Investir só em blue chips dá previsibilidade e liquidez, mas limita o potencial de crescimento. A literatura de mercado mostra que small caps superam blue chips no longo prazo, com mais volatilidade no caminho. O ideal é uma mistura conforme seu perfil: investidor conservador com 70-80% em blue chips, agressivo com 30-40% em small e mid caps.',
      },
      {
        q: 'Como o market cap muda ao longo do tempo?',
        a: 'O market cap muda diariamente porque o preço da ação muda. Mudanças na quantidade de ações (recompras, emissões, splits, bonificações) também afetam, mas são eventos pontuais. Acompanhar o ranking ao longo do tempo mostra quem está ganhando relevância no mercado e quem está perdendo.',
      },
    ],
  },

  // ============================================================
  // 2. Mais Baratas (Graham)
  // ============================================================
  'mais-baratas-graham': {
    slug: 'mais-baratas-graham',
    title: 'Mais Baratas (Graham)',
    metaTitle: 'Ações Mais Baratas pela Fórmula de Graham 2026 | Redentia',
    metaDescription:
      'Top 50 ações com maior desconto pela Fórmula de Graham (raiz de 22.5 × LPA × VPA). Estratégia value clássica de Benjamin Graham aplicada à B3.',
    h1: 'Ações Mais Baratas pela Fórmula de Graham',
    subtitle:
      'As 50 ações brasileiras com maior desconto em relação ao preço justo calculado pela Fórmula de Graham, raiz quadrada de 22,5 vezes o LPA vezes o VPA. Estratégia clássica de value investing de Benjamin Graham.',
    icon: 'i-lucide-target',
    iconColor: 'positive',
    badges: [
      { icon: 'i-lucide-refresh-cw', text: 'Atualizado diariamente' },
      { icon: 'i-lucide-database', text: 'Dados B3' },
      { icon: 'i-lucide-trophy', text: 'Top 50' },
      { icon: 'i-lucide-sigma', text: 'Fórmula Graham' },
    ],
    columns: ['grahamPrice', 'upsidePct', 'change', 'marketCap'],
    fetcher: (service, type) => service.getGrahamDiscount(type, 50),
    educationalSections: [
      {
        h2: 'O que é a Fórmula de Graham?',
        paragraphs: [
          'A Fórmula de Graham, criada por Benjamin Graham (mentor de Warren Buffett) em "O Investidor Inteligente", calcula o preço justo de uma ação como a raiz quadrada de 22,5 multiplicado pelo LPA (lucro por ação) e pelo VPA (valor patrimonial por ação). O número 22,5 vem do produto entre P/L máximo de 15 e P/VPA máximo de 1,5 que Graham considerava aceitáveis.',
          'O resultado é um preço teórico que serve de referência. Se a ação negocia abaixo desse preço, está descontada (oportunidade de value). Se acima, está cara em relação aos fundamentos. O upside calculado mostra quanto a ação precisaria subir pra atingir o preço Graham.',
        ],
      },
      {
        h2: 'Como interpretar o ranking',
        paragraphs: [
          'As ações no topo do ranking são as que estão negociando com maior desconto em relação ao preço Graham, ou seja, aparentemente baratas. Quanto maior o upside teórico, maior a margem de segurança no investimento (conceito central de Graham).',
          'Como ponto de partida pra value investing, o ranking é útil. A próxima etapa é entender por que a ação está descontada: a empresa está fora do radar do mercado (oportunidade) ou tem problemas reais que justificam o desconto (armadilha)? Use a calculadora de preço teto pra rodar a sua própria análise com dados atualizados.',
        ],
      },
      {
        h2: 'Limitações da Fórmula de Graham',
        paragraphs: [
          'A fórmula original de Graham foi pensada pra ações industriais americanas dos anos 1970, com setores estáveis e crescimento moderado. Empresas de tecnologia, growth e setores com lucro irregular (commodities, mineração, cíclicas) podem dar resultados estranhos. Use esse ranking como triagem inicial, não como decisão final.',
          'Outra limitação importante: ações podem ficar baratas por meses ou anos, isso é o famoso value trap. Sempre cruze com qualidade dos fundamentos (ROE alto, margem estável, baixo endividamento) e contexto setorial. Empresa em setor em declínio pode estar barata por motivo justo.',
        ],
      },
    ],
    crossLinks: [
      linkPrecoTeto,
      linkSimuladorAcoes,
      linkDividendYield,
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'Como funciona a Fórmula de Graham na prática?',
        a: 'Pegue o LPA (lucro por ação dos últimos 12 meses) e o VPA (valor patrimonial por ação) da empresa. Multiplique os dois, multiplique por 22,5 e tire a raiz quadrada. O resultado é o preço justo. Exemplo: empresa com LPA de R$ 4 e VPA de R$ 25 tem preço Graham igual a raiz de (22,5 × 4 × 25) = raiz de 2.250 = R$ 47,43.',
      },
      {
        q: 'Quem foi Benjamin Graham?',
        a: 'Benjamin Graham (1894-1976) é considerado o pai do value investing. Foi professor de Warren Buffett na Columbia Business School e autor dos clássicos "Security Analysis" (1934) e "O Investidor Inteligente" (1949). Sua fórmula busca identificar ações negociadas abaixo do valor intrínseco com margem de segurança.',
      },
      {
        q: 'Posso usar a fórmula pra FIIs ou ETFs?',
        a: 'Não diretamente. A fórmula assume LPA e VPA tradicionais de empresas operacionais, métricas que FIIs e ETFs não calculam da mesma forma. Pra FIIs, use o P/VP (preço sobre valor patrimonial) e dividend yield. Pra ETFs, foque em taxa de administração e composição da carteira.',
      },
      {
        q: 'Qual a diferença entre Graham e Bazin?',
        a: 'Graham busca preço justo a partir de lucro e patrimônio (LPA e VPA). Bazin foca em renda passiva: divide o dividendo anual por uma taxa de retorno desejada (geralmente 6%). São abordagens complementares, Graham para empresas em geral, Bazin específicamente para investidores de dividendos.',
      },
    ],
  },

  // ============================================================
  // 3. Mais Baratas (Bazin)
  // ============================================================
  'mais-baratas-bazin': {
    slug: 'mais-baratas-bazin',
    title: 'Mais Baratas (Bazin)',
    metaTitle: 'Ações Mais Baratas pela Fórmula de Bazin 2026 | Redentia',
    metaDescription:
      'Top 50 ações descontadas pela Fórmula de Bazin (dividendo anual ÷ 6%). Estratégia de Décio Bazin para investidor de renda passiva e dividendos.',
    h1: 'Ações Mais Baratas pela Fórmula de Bazin',
    subtitle:
      'As 50 ações brasileiras com maior desconto pela Fórmula de Bazin, dividendo médio anual dividido por 6 por cento. Foco em quem busca renda passiva por dividendos consistentes.',
    icon: 'i-lucide-piggy-bank',
    iconColor: 'positive',
    badges: [
      { icon: 'i-lucide-refresh-cw', text: 'Atualizado diariamente' },
      { icon: 'i-lucide-database', text: 'Dados B3' },
      { icon: 'i-lucide-trophy', text: 'Top 50' },
      { icon: 'i-lucide-sigma', text: 'Fórmula Bazin' },
    ],
    columns: ['bazinPrice', 'upsidePct', 'dy', 'marketCap'],
    fetcher: (service, type) => service.getBazinDiscount(type, 50),
    educationalSections: [
      {
        h2: 'O que é a Fórmula de Bazin?',
        paragraphs: [
          'A Fórmula de Bazin, criada por Décio Bazin no clássico "Faça Fortuna com Ações, Antes que Seja Tarde", calcula o preço justo de uma ação como o dividendo médio dos últimos 5 anos dividido por 6 por cento (a taxa mínima de retorno em dividendos que ele considerava razoável).',
          'A lógica é direta: se você quer pelo menos 6 por cento ao ano em dividendos sobre o capital investido, basta dividir o dividendo pago pelo retorno desejado pra saber o preço máximo que você pode pagar. Empresa que paga R$ 3 ao ano em dividendos vale no máximo R$ 50 (3 dividido por 0,06).',
        ],
      },
      {
        h2: 'Como interpretar o ranking',
        paragraphs: [
          'As ações no topo do ranking pagam dividendos altos em relação ao preço de mercado, sinalizando potencial atratividade pra investidor focado em renda. Quanto maior o upside calculado, mais espaço pra valorização (assumindo que os dividendos vão se manter no patamar histórico).',
          'Bazin é especialmente útil pra montar carteira de geração de renda mensal ou trimestral. Bancos (ITUB4, BBAS3, BBDC4), seguradoras (BBSE3) e utilities (TAEE11, TRPL4) costumam aparecer com frequência por terem fluxo de caixa estável e payout alto.',
        ],
      },
      {
        h2: 'Limitações da Fórmula de Bazin',
        paragraphs: [
          'A fórmula assume que os dividendos pagos no passado vão se repetir no futuro. Empresas em setores cíclicos (commodities, varejo) podem ter dividendos altíssimos em um ano e zero no seguinte. Sempre cheque a consistência do pagamento nos últimos 5 anos antes de usar Bazin como referência.',
          'Outro ponto: dividendo alto pode ser sintoma de dificuldade de investir em crescimento. Se a empresa distribui 90 por cento do lucro porque não tem onde crescer, o investidor recebe renda hoje mas perde a chance de ver o capital se multiplicar. Cruze sempre com payout ratio e CAGR de receita.',
        ],
      },
    ],
    crossLinks: [
      linkPrecoTeto,
      linkDividendYield,
      linkSimuladorAcoes,
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'Quem foi Décio Bazin?',
        a: 'Décio Bazin (1933-2003) foi jornalista financeiro brasileiro e autor de "Faça Fortuna com Ações, Antes que Seja Tarde", lançado em 1992. O livro consolidou no mercado brasileiro a estratégia de investir em ações que pagam dividendos consistentes e oferece a fórmula que carrega seu nome.',
      },
      {
        q: 'Por que 6 por cento na Fórmula de Bazin?',
        a: 'Bazin escolheu 6 por cento ao ano como a taxa mínima de retorno em dividendos que justifica o risco de comprar uma ação no lugar de uma renda fixa segura. O número é discutível e algumas adaptações usam 4 por cento (mais agressivo) ou 8 por cento (mais conservador). Mantemos 6 por cento como padrão histórico do livro.',
      },
      {
        q: 'A fórmula serve para FIIs?',
        a: 'Sim, com adaptação. FIIs distribuem rendimentos mensais (não dividendos anuais), então some os pagamentos dos últimos 12 meses pra ter o equivalente. A taxa mínima também muda: pra FIIs, é razoável usar 8-10 por cento dado o risco maior. Resultado: dividendo anual dos últimos 12 meses dividido por 0,08 ou 0,10.',
      },
      {
        q: 'O que fazer quando a fórmula dá um valor muito acima do preço atual?',
        a: 'Investigue por que o mercado está pagando tão pouco. Possíveis razões: dividendo alto vai ser cortado (queda de lucro), risco regulatório (energia, bancos estatais), problemas governança. Se nada disso aparecer, pode ser uma boa oportunidade de value. Use a calculadora de preço teto pra refinar.',
      },
    ],
  },

  // ============================================================
  // 4. Maiores Margem Líquida
  // ============================================================
  'maiores-margem-liquida': {
    slug: 'maiores-margem-liquida',
    title: 'Maiores Margem Líquida',
    metaTitle: 'Maiores Margens Líquidas da B3 2026 | Redentia',
    metaDescription:
      'Top 50 empresas brasileiras com maior margem líquida (lucro ÷ receita). Mostra eficiência operacional e poder de geração de caixa por real vendido.',
    h1: 'Maiores Margens Líquidas da Bolsa',
    subtitle:
      'As 50 empresas listadas na B3 que mais convertem receita em lucro líquido, indicador chave de eficiência operacional e poder de precificação. Atualizado com últimos balanços.',
    icon: 'i-lucide-percent',
    iconColor: 'primary',
    badges: [
      { icon: 'i-lucide-refresh-cw', text: 'Atualizado diariamente' },
      { icon: 'i-lucide-database', text: 'Dados B3' },
      { icon: 'i-lucide-trophy', text: 'Top 50' },
      { icon: 'i-lucide-trending-up', text: 'Eficiência' },
    ],
    columns: ['netMargin', 'revenue', 'netIncome', 'marketCap'],
    fetcher: (service, type) => service.getTopNetMargin(type, 50),
    educationalSections: [
      {
        h2: 'O que é Margem Líquida?',
        paragraphs: [
          'Margem líquida é o percentual da receita total da empresa que sobra como lucro líquido depois de todos os custos, despesas e impostos. A fórmula é simples: lucro líquido dividido pela receita total, multiplicado por 100. Uma margem de 20 por cento significa que pra cada R$ 100 vendidos, a empresa fica com R$ 20 de lucro.',
          'É um dos indicadores mais importantes pra avaliar a saúde operacional de uma empresa. Margem alta indica poder de precificação, eficiência operacional ou modelo de negócio com baixos custos variáveis (software, financeiro, royalties). Margem baixa pode indicar setor competitivo, custos altos ou estrutura ineficiente.',
        ],
      },
      {
        h2: 'Como interpretar o ranking',
        paragraphs: [
          'Setores com margem líquida tipicamente alta: bancos (20-30 por cento), seguradoras (15-25 por cento), bolsas (B3 com 50+ por cento), tecnologia, royalties e algumas utilities reguladas. Setores com margem líquida baixa: varejo (3-7 por cento), construção (5-10 por cento), commodities (variável conforme ciclo).',
          'Comparação justa só faz sentido dentro do mesmo setor. Pegar uma varejista com margem de 6 por cento e comparar com um banco com margem de 25 por cento não diz nada sobre qualidade. Use o ranking como triagem inicial e depois compare empresas do mesmo setor entre si.',
        ],
      },
      {
        h2: 'Limitações',
        paragraphs: [
          'Margem líquida é influenciada por itens não recorrentes: ganhos extraordinários (venda de ativos), perdas pontuais (provisões, ações judiciais) ou benefícios fiscais. Sempre olhe pelo menos 3 anos pra ver se a margem é estrutural ou eventual.',
          'Margem alta sozinha não basta. Empresa com margem de 30 por cento mas crescimento zero pode ser pior que empresa com margem de 8 por cento e CAGR de 15 por cento. Cruze com crescimento de receita, ROE e geração de caixa antes de tirar conclusões.',
        ],
      },
    ],
    crossLinks: [
      linkPrecoTeto,
      linkSimuladorAcoes,
      linkDividendYield,
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'Qual é uma boa margem líquida no Brasil?',
        a: 'Depende do setor. Em geral, acima de 10 por cento já é considerado bom. Bancos e seguradoras costumam ficar entre 20-30 por cento. Empresas de software e royalties podem passar de 30 por cento. Varejo e construção operam com margem entre 3-10 por cento e ainda assim podem ser excelentes investimentos.',
      },
      {
        q: 'Margem líquida ou margem EBITDA, qual é mais importante?',
        a: 'Servem pra coisas diferentes. Margem EBITDA mostra eficiência puramente operacional (sem juros, impostos, depreciação). Margem líquida mostra o que sobra de fato pra distribuir aos acionistas ou reinvestir. Investidores costumam olhar as duas em conjunto: EBITDA pra entender o negócio, líquida pra entender o que rende.',
      },
      {
        q: 'Como margem líquida se relaciona com ROE?',
        a: 'Margem líquida é uma das peças do ROE pela decomposição DuPont: ROE = margem líquida × giro de ativos × alavancagem. Empresa com margem alta E giro alto E alavancagem moderada vai ter ROE acima de 20 por cento. Sempre que ver ROE alto, vale checar de onde ele vem.',
      },
      {
        q: 'O que reduz a margem líquida ano a ano?',
        a: 'Vários fatores: aumento de custos de matéria prima, salários, energia (commodities afetadas), entrada de concorrentes (queda de preço), expansão acelerada (custos crescem antes da receita), provisões fiscais ou ações judiciais. Sempre leia o release trimestral pra entender o porquê.',
      },
    ],
  },

  // ============================================================
  // 5. Buy and Hold (Score)
  // ============================================================
  'buy-and-hold': {
    slug: 'buy-and-hold',
    title: 'Buy and Hold (Score)',
    metaTitle: 'Melhores Ações Buy and Hold 2026 | Score 0-10 | Redentia',
    metaDescription:
      'Score de 0 a 10 que combina ROE, dividend yield, dívida e consistência de lucros. Top 50 ações para estratégia de longo prazo na bolsa brasileira.',
    h1: 'Melhores Ações para Buy and Hold',
    subtitle:
      'Score proprietário de 0 a 10 que combina ROE consistente, dividend yield, baixo endividamento e regularidade de pagamentos. Pensado para o investidor de longo prazo que segue a filosofia buy and hold.',
    icon: 'i-lucide-shield-check',
    iconColor: 'primary',
    badges: [
      { icon: 'i-lucide-refresh-cw', text: 'Atualizado diariamente' },
      { icon: 'i-lucide-database', text: 'Dados B3' },
      { icon: 'i-lucide-trophy', text: 'Top 50' },
      { icon: 'i-lucide-gauge', text: 'Score 0-10' },
    ],
    columns: ['buyHoldScore', 'dy', 'roe', 'marketCap'],
    fetcher: (service, type) => service.getBuyAndHold(type, 50),
    educationalSections: [
      {
        h2: 'O que é a estratégia Buy and Hold?',
        paragraphs: [
          'Buy and hold é a filosofia de comprar boas ações e mantê-las por longos períodos (5, 10 ou mais anos), independente das oscilações de curto prazo. A ideia, popularizada por Warren Buffett e Charlie Munger, é que empresas com fundamentos sólidos tendem a se valorizar no longo prazo, e tentar acertar o timing do mercado é improdutivo pra maioria dos investidores.',
          'O score combina quatro pilares: ROE consistente (mostra qualidade do negócio), dividend yield (renda passiva), endividamento controlado (resiliência em crises) e regularidade de pagamentos (previsibilidade). Quanto maior o score, mais a empresa se encaixa no perfil clássico de buy and hold.',
        ],
      },
      {
        h2: 'Como interpretar o score',
        paragraphs: [
          'Score 8-10: Top tier. Empresa com ROE consistentemente acima de 15 por cento, dividendos pagos por 5+ anos, dívida líquida controlada (geralmente abaixo de 2x EBITDA). Candidatas naturais a virar core position de carteira de longo prazo.',
          'Score 5-7: Boa qualidade com algum ponto de atenção. Pode ser ROE mais baixo, dividendos menos consistentes ou endividamento maior. Vale entrar mas com peso menor na carteira. Score abaixo de 5: empresa não atende os critérios mínimos do filtro buy and hold, melhor evitar pra essa estratégia específica (pode ser uma boa empresa pra outra estratégia, como growth ou turnaround).',
        ],
      },
      {
        h2: 'Limitações',
        paragraphs: [
          'Score é uma simplificação. Empresas com score alto podem cair (qualquer ativo cai), e empresas com score baixo podem virar histórias incríveis (turnarounds, crescimento explosivo de small caps). O score serve pra triagem, não pra decisão final. Sempre faça análise individual.',
          'Buy and hold também não é estratégia única. Em setores cíclicos (commodities, construção), comprar e segurar pode dar muito errado se você entrar no topo do ciclo. Pra esses casos, vale combinar com indicadores de timing (preço Graham, preço Bazin) pra escolher melhor o momento de entrada.',
        ],
      },
    ],
    crossLinks: [
      linkDividendYield,
      linkPrecoTeto,
      linkSimuladorAcoes,
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'Quanto tempo é considerado buy and hold?',
        a: 'A literatura clássica fala em 5 anos no mínimo, idealmente 10+ anos. Warren Buffett fala em "para sempre" como horizonte mental, ainda que vendas eventuais aconteçam. O importante é entrar com a tese de longo prazo e não mexer na posição por motivo de oscilação de curto prazo (notícia, ruído, queda mensal).',
      },
      {
        q: 'Posso fazer buy and hold com FIIs?',
        a: 'Sim, e funciona muito bem. FIIs com gestão sólida, contratos longos e baixa vacância tendem a entregar fluxo de dividendos previsível por décadas. HGLG11, KNCR11, MXRF11 são exemplos comuns em carteiras de buy and hold em FIIs. Aplica os mesmos critérios: yield consistente, baixo endividamento, gestão experiente.',
      },
      {
        q: 'O que fazer quando uma ação buy and hold cai 30 por cento?',
        a: 'Primeiro, separe queda de mercado (efeito Ibovespa, macro) de queda específica (problema da empresa). Se a tese original continua válida (ROE alto, dividendos consistentes, sem mudança estrutural), aproveitar pra aumentar a posição faz sentido. Se a tese mudou (perdeu vantagem competitiva, problemas governança), reavaliar venda.',
      },
      {
        q: 'Como rebalancear uma carteira de buy and hold?',
        a: 'Reavalie no mínimo 1 vez por ano, idealmente 2 vezes (fim do segundo trimestre e fim de ano). Cheque se cada ativo ainda está dentro da tese original e ajuste o peso conforme a alocação alvo. Evite rebalancear por movimento de preço de curto prazo, foque em fundamentos.',
      },
    ],
  },

  // ============================================================
  // 6. Maiores Receitas
  // ============================================================
  'maiores-receitas': {
    slug: 'maiores-receitas',
    title: 'Maiores Receitas',
    metaTitle: 'Maiores Receitas da Bolsa Brasileira 2026 | Redentia',
    metaDescription:
      'Top 50 empresas com maior receita anual da B3, Petrobras, Vale, JBS, Marfrig, Ambev. Faturamento líquido dos últimos 12 meses, ranking atualizado.',
    h1: 'Maiores Receitas da Bolsa Brasileira',
    subtitle:
      'As 50 empresas listadas na B3 com maior faturamento dos últimos 12 meses. Petrobras, Vale, JBS, Marfrig, Ambev, dominam por escala e cobertura de mercado. Atualizado com últimos balanços.',
    icon: 'i-lucide-bar-chart-3',
    iconColor: 'primary',
    badges: [
      { icon: 'i-lucide-refresh-cw', text: 'Atualizado diariamente' },
      { icon: 'i-lucide-database', text: 'Dados B3' },
      { icon: 'i-lucide-trophy', text: 'Top 50' },
      { icon: 'i-lucide-banknote', text: 'TTM' },
    ],
    columns: ['revenue', 'netIncome', 'marketCap', 'change'],
    fetcher: (service, type) => service.getTopRevenue(type, 50),
    educationalSections: [
      {
        h2: 'O que é Receita Líquida?',
        paragraphs: [
          'Receita líquida (ou receita operacional líquida) é o total que a empresa faturou no período, descontados impostos sobre vendas (ICMS, PIS, Cofins) e devoluções. É a primeira linha do DRE (Demonstração de Resultados) e o ponto de partida pra calcular qualquer margem ou indicador operacional.',
          'No ranking usamos receita TTM (trailing twelve months), ou seja, dos últimos 12 meses fechados. Isso evita distorção de sazonalidade (varejo concentrado no quarto trimestre, agronegócio na safra) e dá uma visão atualizada do tamanho operacional da empresa.',
        ],
      },
      {
        h2: 'Como interpretar o ranking',
        paragraphs: [
          'O ranking mostra escala operacional, não rentabilidade. Petrobras lidera por refinar e vender milhões de barris de petróleo diariamente, JBS e Marfrig por dominarem o mercado global de proteína animal. Receita alta é vantagem competitiva (escala, poder de barganha com fornecedores, custos diluídos), mas não garante lucro proporcional.',
          'Cruze esse ranking com margem líquida (outra página de ranking) pra ver quem realmente converte receita em valor. JBS pode faturar mais que Itaú, mas o Itaú dá muito mais lucro por real faturado. As duas leituras são complementares.',
        ],
      },
      {
        h2: 'Limitações',
        paragraphs: [
          'Receita pode crescer sem criar valor. Empresa que cresce vendas via descontos agressivos ou aquisições sem sinergia destrói margem e ROE. Sempre olhe a evolução da receita JUNTO com margem e geração de caixa, não isolada.',
          'Setores muito alavancados (commodities, energia) tem receita altamente correlacionada com preço de mercado da commodity. Petrobras com Brent a 100 dólares por barril fatura muito; com Brent a 50, a receita despenca. Não confunda crescimento estrutural com sorte de ciclo.',
        ],
      },
    ],
    crossLinks: [
      linkSimuladorAcoes,
      linkPrecoTeto,
      linkDividendYield,
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'Qual a empresa com maior receita do Brasil?',
        a: 'Tipicamente a Petrobras, que fatura entre R$ 500 bilhões e R$ 800 bilhões por ano dependendo do preço do petróleo. Vale, JBS, Marfrig e Ambev também aparecem entre as primeiras, com receitas anuais entre R$ 100 bilhões e R$ 300 bilhões.',
      },
      {
        q: 'Receita bruta ou receita líquida, qual usar?',
        a: 'Sempre receita líquida pra análise de empresas. Receita bruta inclui impostos sobre vendas, que não pertencem à empresa (são repassados ao governo). Receita líquida é o que efetivamente entra no caixa operacional. Todos os indicadores de margem são calculados sobre receita líquida.',
      },
      {
        q: 'Como avaliar crescimento de receita?',
        a: 'Compare CAGR (taxa composta) de 5 anos versus inflação e crescimento do setor. Crescer 8 por cento em ano com IPCA de 5 por cento é crescimento real de 3 por cento (modesto). Mas crescer 15 por cento em setor que cresce 4 por cento é forte ganho de market share. Contexto setorial é tudo.',
      },
      {
        q: 'Por que algumas empresas pagam dividendo alto sem ter receita gigante?',
        a: 'Porque receita não é lucro. Bolsas (B3SA3), seguradoras (BBSE3), holdings com participações relevantes podem ter receita modesta mas margem altíssima e payout próximo de 100 por cento. O que importa pra dividendo é lucro distribuível, não tamanho do faturamento.',
      },
    ],
  },

  // ============================================================
  // 7. Maiores Lucros
  // ============================================================
  'maiores-lucros': {
    slug: 'maiores-lucros',
    title: 'Maiores Lucros',
    metaTitle: 'Maiores Lucros da Bolsa Brasileira 2026 | Redentia',
    metaDescription:
      'Top 50 empresas com maior lucro líquido anual da B3. Petrobras, Itaú, Vale, Bradesco, BB. Lucro líquido TTM atualizado com últimos balanços oficiais.',
    h1: 'Maiores Lucros da Bolsa Brasileira',
    subtitle:
      'As 50 empresas com maior lucro líquido nos últimos 12 meses na B3. Petrobras, Itaú, Vale, Bradesco e Banco do Brasil costumam liderar pela combinação de escala e margem. Atualizado com balanços recentes.',
    icon: 'i-lucide-coins',
    iconColor: 'primary',
    badges: [
      { icon: 'i-lucide-refresh-cw', text: 'Atualizado diariamente' },
      { icon: 'i-lucide-database', text: 'Dados B3' },
      { icon: 'i-lucide-trophy', text: 'Top 50' },
      { icon: 'i-lucide-banknote', text: 'TTM' },
    ],
    columns: ['netIncome', 'revenue', 'netMargin', 'marketCap'],
    fetcher: (service, type) => service.getTopNetIncome(type, 50),
    educationalSections: [
      {
        h2: 'O que é Lucro Líquido?',
        paragraphs: [
          'Lucro líquido é o resultado final do exercício depois de todas as despesas operacionais, financeiras, impostos e participações de minoritários. É o último número do DRE e a base pra calcular dividendos, lucro por ação (LPA) e ROE.',
          'No ranking usamos lucro líquido TTM (últimos 12 meses) pra suavizar sazonalidade e itens não recorrentes. Isso dá uma visão mais limpa da capacidade operacional da empresa de gerar valor pros acionistas.',
        ],
      },
      {
        h2: 'Como interpretar o ranking',
        paragraphs: [
          'Liderança consistente costuma ficar com bancos (Itaú, Bradesco, BB), Petrobras (cíclico ao petróleo) e Vale (cíclico ao minério). Entre as 50 maiores, encontramos seguradoras, energia, varejo, bebidas e indústria, mostrando diversidade setorial.',
          'Lucro alto sozinho não garante boa ação. Empresa com lucro de R$ 30 bilhões mas market cap de R$ 600 bilhões tem P/L de 20 (caro). Já lucro de R$ 5 bilhões com market cap de R$ 30 bilhões dá P/L de 6 (barato). Sempre cruze com market cap e P/L pra ver se o preço acompanha o tamanho do lucro.',
        ],
      },
      {
        h2: 'Limitações',
        paragraphs: [
          'Lucro pode ser inflado por itens não recorrentes (venda de ativos, créditos fiscais). Sempre olhe lucro recorrente vs lucro contábil no release. Investidor profissional foca no recorrente pra projetar capacidade de pagamento futura.',
          'Lucro contábil também pode divergir bastante de geração de caixa. Empresa com lucro alto mas capex alto e provisões pode estar queimando caixa enquanto o DRE diz que está indo bem. Cruze sempre com fluxo de caixa operacional e livre.',
        ],
      },
    ],
    crossLinks: [
      linkSimuladorAcoes,
      linkPrecoTeto,
      linkDividendYield,
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'Qual empresa lucra mais no Brasil?',
        a: 'Tipicamente alterna entre Petrobras (em ciclos de petróleo alto) e Itaú Unibanco (estabilidade bancária). Em 2022-2023, a Petrobras chegou a R$ 180 bilhões de lucro anual, recorde absoluto da bolsa brasileira. Itaú gira na faixa de R$ 35-45 bilhões anuais, com crescimento mais previsível.',
      },
      {
        q: 'Lucro recorrente ou lucro contábil?',
        a: 'Pra projetar capacidade futura, foque no lucro recorrente (sem itens extraordinários). Pra calcular dividendos, use o lucro contábil (que é a base legal). Empresas costumam divulgar os dois no release trimestral. Diferenças grandes entre os dois exigem investigação.',
      },
      {
        q: 'Lucro por ação (LPA) ou lucro líquido total?',
        a: 'Pra comparar o tamanho da empresa, use lucro líquido total. Pra valuation por ação, use LPA (lucro líquido dividido pelo número de ações). Recompras de ações reduzem o número de ações em circulação e aumentam o LPA mesmo sem mudança no lucro total, sinal positivo pro acionista remanescente.',
        },
      {
        q: 'Como o lucro influencia dividendos?',
        a: 'Empresas distribuem uma parcela do lucro como dividendo (payout). No Brasil, payout entre 25-50 por cento é comum pra ações, e 95 por cento obrigatório pra FIIs. Bancos como BBAS3 e BBSE3 pagam acima de 60 por cento por terem caixa de sobra. Lucro estável + payout alto = dividendo previsível.',
      },
    ],
  },

  // ============================================================
  // 8. Maiores ROEs
  // ============================================================
  'maiores-roe': {
    slug: 'maiores-roe',
    title: 'Maiores ROEs',
    metaTitle: 'Maiores ROEs da Bolsa Brasileira 2026 | Redentia',
    metaDescription:
      'Top 50 ações com maior ROE (Return on Equity) da B3. Mostra quanto a empresa lucra sobre o capital próprio. Indicador chave de qualidade.',
    h1: 'Maiores ROEs da Bolsa Brasileira',
    subtitle:
      'As 50 empresas com maior retorno sobre patrimônio líquido (ROE) na B3. Indicador favorito de Buffett pra identificar negócios de alta qualidade. Atualizado com últimos balanços.',
    icon: 'i-lucide-zap',
    iconColor: 'primary',
    badges: [
      { icon: 'i-lucide-refresh-cw', text: 'Atualizado diariamente' },
      { icon: 'i-lucide-database', text: 'Dados B3' },
      { icon: 'i-lucide-trophy', text: 'Top 50' },
      { icon: 'i-lucide-award', text: 'Qualidade' },
    ],
    columns: ['roe', 'netMargin', 'dy', 'marketCap'],
    fetcher: (service, type) => service.getTopROE(type, 50),
    educationalSections: [
      {
        h2: 'O que é ROE (Return on Equity)?',
        paragraphs: [
          'ROE é o retorno sobre o patrimônio líquido, calculado dividindo o lucro líquido pelo patrimônio líquido. Mostra quanto a empresa gera de lucro pra cada real que os acionistas colocaram (capital próprio + lucros retidos). Um ROE de 20 por cento significa que pra cada R$ 100 de patrimônio, a empresa gerou R$ 20 de lucro no ano.',
          'É o indicador favorito de Warren Buffett pra identificar negócios de alta qualidade. Empresas com ROE consistente acima de 15 por cento por muitos anos seguidos costumam ter vantagem competitiva durável (marca forte, custo baixo, switching cost alto, efeito de rede).',
        ],
      },
      {
        h2: 'Como interpretar o ranking',
        paragraphs: [
          'ROE entre 10-15 por cento: aceitável, próximo da média de mercado. ROE entre 15-25 por cento: muito bom, sinal de qualidade operacional. ROE acima de 25 por cento: excepcional, geralmente vem com vantagem competitiva clara ou alavancagem alta (cuidado).',
          'Pra avaliar bem, sempre cruze ROE com endividamento. Empresa pode forçar ROE alto via alta alavancagem (mais dívida = menos patrimônio = ROE maior na conta). Bancos costumam ter ROE de 15-20 por cento com alavancagem natural do negócio. Industriais com ROE de 25 por cento sem dívida são a verdadeira excelência.',
        ],
      },
      {
        h2: 'Limitações',
        paragraphs: [
          'Decomposição DuPont: ROE = margem líquida × giro de ativos × alavancagem. Empresa pode atingir o mesmo ROE de 20 por cento por caminhos muito diferentes (margem alta vs giro alto vs muita dívida). Sempre vale a pena olhar a decomposição pra entender de onde vem o retorno.',
          'ROE pontual pode ser enganoso. Lucro extraordinário em um trimestre infla ROE temporariamente. Sempre pegue média de 3-5 anos pra ter visão real da capacidade da empresa de gerar valor sobre o patrimônio.',
        ],
      },
    ],
    crossLinks: [
      linkPrecoTeto,
      linkSimuladorAcoes,
      linkDividendYield,
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'Qual ROE é considerado bom?',
        a: 'Acima de 15 por cento é considerado bom no Brasil. Acima de 20 por cento é muito bom e sinaliza qualidade do negócio. Acima de 25 por cento é excepcional e merece análise extra (pode ser vantagem competitiva real ou alavancagem disfarçando o número).',
      },
      {
        q: 'ROE vs ROIC, qual a diferença?',
        a: 'ROE mede retorno sobre o capital dos acionistas (patrimônio). ROIC mede retorno sobre todo o capital investido (próprio + dívida). ROIC é mais "puro" porque elimina o efeito da estrutura de capital. Empresa com ROE alto mas ROIC baixo está usando alavancagem pra inflar o número.',
      },
      {
        q: 'Por que bancos têm ROE alto naturalmente?',
        a: 'Bancos têm modelo de negócio inerentemente alavancado (depósitos viram empréstimos), então o multiplicador de patrimônio é alto. Isso amplifica o ROE comparado a empresas industriais. Por isso comparar ROE de banco com ROE de uma siderúrgica não faz sentido, sempre dentro do mesmo setor.',
      },
      {
        q: 'ROE pode ser negativo?',
        a: 'Sim, quando a empresa tem prejuízo no ano. ROE negativo significa que a empresa destruiu valor do capital dos acionistas no período. Empresas em recuperação podem ter alguns anos de ROE negativo seguidos de retorno positivo, ciclo comum em turnarounds.',
      },
    ],
  },

  // ============================================================
  // 9. Menores P/Ls
  // ============================================================
  'menores-pl': {
    slug: 'menores-pl',
    title: 'Menores P/Ls',
    metaTitle: 'Menores P/Ls da Bolsa Brasileira 2026 | Redentia',
    metaDescription:
      'Top 50 ações com menor P/L (preço sobre lucro) da B3. Empresas potencialmente baratas em relação ao lucro. Atenção: P/L baixo pode ser value trap.',
    h1: 'Menores P/Ls da Bolsa Brasileira',
    subtitle:
      'As 50 ações da B3 com menor P/L (preço sobre lucro), indicador clássico de quanto o mercado paga pra cada real de lucro da empresa. Pode revelar oportunidades de value, mas também armadilhas.',
    icon: 'i-lucide-tag',
    iconColor: 'positive',
    badges: [
      { icon: 'i-lucide-refresh-cw', text: 'Atualizado diariamente' },
      { icon: 'i-lucide-database', text: 'Dados B3' },
      { icon: 'i-lucide-trophy', text: 'Top 50' },
      { icon: 'i-lucide-alert-triangle', text: 'Value trap?' },
    ],
    columns: ['pe', 'dy', 'marketCap', 'change'],
    fetcher: (service, type) => service.getLowPE(type, 50),
    educationalSections: [
      {
        h2: 'O que é P/L (Preço sobre Lucro)?',
        paragraphs: [
          'P/L é a razão entre o preço atual da ação e o lucro por ação (LPA) dos últimos 12 meses. Indica quantos anos de lucro atual o investidor está pagando pra comprar a ação. P/L de 8 significa que se a empresa mantiver o lucro atual, em 8 anos o lucro acumulado iguala o investimento.',
          'É um dos indicadores mais usados em valuation por sua simplicidade. P/L baixo pode indicar oportunidade (ação descontada) ou armadilha (lucro temporariamente alto que vai cair). P/L alto pode ser empresa cara ou empresa com crescimento esperado (a famosa "P/L pago pelo crescimento").',
        ],
      },
      {
        h2: 'Como interpretar o ranking',
        paragraphs: [
          'P/L típico do Ibovespa fica entre 8-15. Abaixo de 8 indica desconto significativo, mas geralmente tem motivo (problemas setoriais, ciclo de baixa, governança). Acima de 20 indica empresa com expectativa de crescimento ou setor "premium" (tecnologia, varejo de luxo). Cada setor tem sua média histórica, sempre vale conferir.',
          'Petrobras com P/L de 4 em ciclo de petróleo alto é caso clássico: lucro recorde no momento, mas mercado precifica que o ciclo vai virar. Quando o petróleo cai, o lucro despenca e o P/L sobe abruptamente. Por isso P/L de empresa cíclica precisa ser olhado com horizonte longo, não snapshot.',
        ],
      },
      {
        h2: 'Atenção ao value trap',
        paragraphs: [
          'Value trap é uma ação com P/L baixo porque o lucro vai cair (não porque a ação está descontada). Sinais de alerta: setor em declínio estrutural, perda de market share, dívida crescente, queda de margem trimestre a trimestre, fuga de talentos, mudança regulatória.',
          'Antes de comprar pelo P/L baixo, faça as perguntas: por que está barato, esse lucro é sustentável, qual o histórico de pagamento de dividendos, qual a qualidade do management. P/L baixo isolado é gatilho pra investigação, não pra compra automática. Use a calculadora de preço teto pra cruzar com Graham e Bazin.',
        ],
      },
    ],
    crossLinks: [
      linkPrecoTeto,
      linkDividendYield,
      linkSimuladorAcoes,
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'Qual P/L é considerado bom?',
        a: 'Depende do setor. P/L abaixo da média do setor pode ser sinal de oportunidade. No agregado da bolsa brasileira, P/L histórico médio fica em torno de 10-13. P/L abaixo de 8 merece investigação extra (oportunidade real ou armadilha). P/L acima de 20 sinaliza expectativa de crescimento que pode ou não se concretizar.',
      },
      {
        q: 'Por que bancos têm P/L tão baixo?',
        a: 'Bancos costumam ter P/L entre 5-10 no Brasil por uma combinação de fatores: lucro alto sobre capital, dividendo alto (mercado prefere recomprar com dividendos vs preço), alavancagem natural do negócio aumenta percepção de risco, e ciclo macro brasileiro sempre traz incerteza sobre inadimplência futura.',
      },
      {
        q: 'P/L negativo o que significa?',
        a: 'Quando a empresa teve prejuízo nos últimos 12 meses, o P/L matemático fica negativo. Nesses casos, o indicador perde utilidade. Pra empresas em prejuízo, use outros indicadores: P/Receita (price to sales), P/EBITDA, ou simplesmente projete cenários de retorno à lucratividade.',
      },
      {
        q: 'P/L 12 meses ou P/L projetado?',
        a: 'P/L 12 meses (TTM) é o histórico real, mais confiável. P/L projetado (forward) usa estimativa de analistas pro próximo ano, mais útil pra empresas em crescimento mas sujeito a erros de projeção. Use TTM como base e forward como complemento, nunca substituindo o histórico.',
      },
    ],
  },

  // ============================================================
  // 10. Maiores Altas (12 meses)
  // ============================================================
  'maiores-altas-12-meses': {
    slug: 'maiores-altas-12-meses',
    title: 'Maiores Altas (12 meses)',
    metaTitle: 'Maiores Altas em 12 Meses da Bolsa B3 2026 | Redentia',
    metaDescription:
      'Top 50 ações que mais subiram nos últimos 12 meses na B3. Performance anualizada, ações em momentum e oportunidades de continuação de alta.',
    h1: 'Maiores Altas em 12 Meses',
    subtitle:
      'As 50 ações e FIIs que mais subiram nos últimos 12 meses na B3. Indica quem está em momentum forte e pode entregar continuação ou virar. Atualizado diariamente após pregão.',
    icon: 'i-lucide-trending-up',
    iconColor: 'positive',
    badges: [
      { icon: 'i-lucide-refresh-cw', text: 'Atualizado diariamente' },
      { icon: 'i-lucide-database', text: 'Dados B3' },
      { icon: 'i-lucide-trophy', text: 'Top 50' },
      { icon: 'i-lucide-rocket', text: 'Momentum' },
    ],
    columns: ['change', 'marketCap', 'dy', 'pe'],
    changeLabel: '12m',
    fetcher: (service, type) => service.getYearlyChange('top', type, 50),
    educationalSections: [
      {
        h2: 'O que mostra esse ranking?',
        paragraphs: [
          'Lista as 50 ações e FIIs com maior valorização nos últimos 12 meses. É um ranking de performance simples mas poderoso, mostra quem ganhou momentum ao longo do ano. Ações no topo costumam refletir crescimento de lucro, melhora setorial, mudança regulatória favorável ou simplesmente entrada de fluxo institucional concentrada.',
          'Diferente do ranking mensal, o de 12 meses suaviza ruído de curto prazo. Uma ação que subiu 200 por cento em 30 dias pode ter sido pump especulativo. Uma ação que subiu 200 por cento em 12 meses tem mais chance de refletir mudança estrutural na empresa ou no setor.',
        ],
      },
      {
        h2: 'Como interpretar o ranking',
        paragraphs: [
          'Estratégia momentum: comprar ações que subiram muito no último ano com aposta de continuidade. Funciona bem em mercados com tendência clara, mas perigoso em viradas de ciclo. Backtests mostram que ações com forte momentum tendem a manter alta por 3-12 meses adicionais antes de retornar à média.',
          'Estratégia value contrarian: olhar a lista e EVITAR as primeiras posições, assumindo que a alta já precificou todo o bom da empresa e o risco de correção é alto. Mais prudente pra investidor de longo prazo, mas perde algumas das melhores oportunidades de continuação de alta.',
        ],
      },
      {
        h2: 'Limitações',
        paragraphs: [
          'Performance passada não garante performance futura. Ações que dobram em 12 meses podem cair 30-50 por cento no ano seguinte por reversão à média. Sempre cruze com fundamentos atuais (P/L, ROE, margem) pra ver se a alta foi sustentada por melhora operacional ou apenas expansão de múltiplo.',
          'Cuidado com small caps com pump artificial. Ações de baixa capitalização e baixa liquidez podem subir muito por movimentação concentrada de poucos players. Confira sempre o volume médio diário e a quantidade de cotistas antes de entrar em altas espetaculares.',
        ],
      },
    ],
    crossLinks: [
      linkPrecoTeto,
      linkDividendYield,
      linkSimuladorAcoes,
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'Comprar ações em alta funciona?',
        a: 'A estratégia momentum tem evidência acadêmica de funcionar no curto-médio prazo (3-12 meses). Mas tem volatilidade alta, pode dar prejuízos significativos em viradas de ciclo. Não recomendado como estratégia única, melhor combinar com filtros de qualidade e disciplina de stop loss.',
      },
      {
        q: 'O que faz uma ação subir muito em 12 meses?',
        a: 'Combinação de fatores: lucro crescendo acima do mercado, expansão de múltiplo (mercado paga mais por cada real de lucro), notícias positivas (aquisição, expansão, prêmio), mudança setorial (ciclo de commodities, política favorável), entrada de fluxo institucional. O melhor cenário combina lucro real + reconhecimento do mercado.',
      },
      {
        q: 'Como saber se uma alta vai continuar?',
        a: 'Não há fórmula garantida, mas indicadores ajudam: lucro crescendo no mesmo ritmo do preço (múltiplo estável), volume crescente em alta (confirmação institucional), ausência de divergências técnicas (preço subindo com força reduzindo). Cruze sempre com a tese fundamentalista da empresa.',
      },
      {
        q: 'Vale a pena vender ações em alta?',
        a: 'Depende da tese e do horizonte. Pra investidor buy and hold com tese sólida, mexer em alta tira você do composto de longo prazo. Pra investidor mais ativo, realização parcial (vender uma parte) em altas grandes faz sentido pra colher ganho e equilibrar risco. A regra de ouro é não deixar emoção decidir.',
      },
    ],
  },

  // ============================================================
  // 11. Maiores Baixas (12 meses)
  // ============================================================
  'maiores-baixas-12-meses': {
    slug: 'maiores-baixas-12-meses',
    title: 'Maiores Baixas (12 meses)',
    metaTitle: 'Maiores Baixas em 12 Meses da Bolsa B3 2026 | Redentia',
    metaDescription:
      'Top 50 ações que mais caíram nos últimos 12 meses na B3. Possíveis oportunidades de turnaround, mas exige análise fundamentalista cuidadosa antes.',
    h1: 'Maiores Baixas em 12 Meses',
    subtitle:
      'As 50 ações e FIIs que mais caíram nos últimos 12 meses na B3. Pode revelar oportunidades de turnaround ou armadilhas de valor. Atualizado diariamente após pregão.',
    icon: 'i-lucide-trending-down',
    iconColor: 'negative',
    badges: [
      { icon: 'i-lucide-refresh-cw', text: 'Atualizado diariamente' },
      { icon: 'i-lucide-database', text: 'Dados B3' },
      { icon: 'i-lucide-trophy', text: 'Top 50' },
      { icon: 'i-lucide-search', text: 'Turnaround?' },
    ],
    columns: ['change', 'marketCap', 'dy', 'pe'],
    changeLabel: '12m',
    fetcher: (service, type) => service.getYearlyChange('bottom', type, 50),
    educationalSections: [
      {
        h2: 'O que mostra esse ranking?',
        paragraphs: [
          'Lista as 50 ações com maior queda nos últimos 12 meses na B3. Pode ser visto de duas formas: como lista de empresas em problemas (evitar) ou como pool de oportunidades de turnaround (potencial value). A leitura correta depende de análise individual de cada caso.',
          'Quedas de 50 por cento ou mais em 12 meses geralmente indicam mudança estrutural: perda de market share, problema regulatório, escândalo de governança, virada de ciclo setorial. Algumas dessas vão se recuperar, outras vão continuar caindo. A diferença está na qualidade dos fundamentos remanescentes.',
        ],
      },
      {
        h2: 'Como interpretar o ranking',
        paragraphs: [
          'Estratégia contrarian: comprar ações em forte queda apostando em recuperação. Funciona quando a queda foi por motivo temporário e os fundamentos seguem sólidos. Não funciona quando a queda foi por motivo estrutural permanente. A diferenciação exige análise profunda do release trimestral, contexto setorial e qualidade da gestão.',
          'Use o ranking como ponto de partida pra investigar. Se uma ação caiu 60 por cento, pergunte: a queda de receita foi proporcional, a margem se manteve, o endividamento aumentou, houve mudança de gestão, o setor inteiro caiu (problema macro) ou só essa empresa (problema específico).',
        ],
      },
      {
        h2: 'Atenção',
        paragraphs: [
          'Pegar facão caindo é o erro clássico. Ação que caiu 50 por cento pode cair mais 50 por cento. Sem catalisador claro de virada (resultados melhorando, novo CEO competente, mudança regulatória favorável), comprar só porque está barato é speculação, não investimento.',
          'Diversificação importa muito em estratégia contrarian. Se você comprar 5 ações em forte queda, é normal que 2-3 continuem caindo e 2-3 se recuperem. O erro é colocar tudo em uma só esperando recuperação certeira. Espalhe risco pra ter chance de capturar os turnarounds que de fato acontecem.',
        ],
      },
    ],
    crossLinks: [
      linkPrecoTeto,
      linkDividendYield,
      linkSimuladorAcoes,
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'Comprar ações em queda funciona?',
        a: 'Funciona se você acertar o fundo e a tese de virada. Erra se comprar e a queda continuar. Estatisticamente, ações em queda forte tendem a continuar caindo no curto prazo (momentum negativo) e podem reverter no médio-longo prazo (12-24 meses) se houver recuperação fundamentalista.',
      },
      {
        q: 'O que faz uma ação cair 50 por cento ou mais em 12 meses?',
        a: 'Combinação de motivos: queda de lucro real (problema operacional), mudança de regulação (perda de margem), perda de competitividade (concorrente novo), escândalo de governança (perda de confiança), virada de ciclo (commodities, juros, política). Investigar a causa principal é o passo um.',
      },
      {
        q: 'Como diferenciar turnaround real de armadilha?',
        a: 'Turnaround real geralmente vem com nova gestão, plano claro de reestruturação, primeiros sinais de melhora operacional (margem subindo, dívida controlada). Armadilha mantém os mesmos problemas trimestre após trimestre sem catalisador de virada. Leia 4-6 releases trimestrais antes de investir em uma situação especial.',
      },
      {
        q: 'Vale a pena comprar bancos quando estão em forte queda?',
        a: 'Bancos brasileiros costumam cair em ciclos de Selic alta (margem cai), aumento de inadimplência (provisões sobem) ou choque macro (Brasil instável). Em geral, são casos clássicos de oportunidade contrarian, dado o histórico de recuperação. Mas exige paciência: ciclos podem durar 2-3 anos antes de virar.',
      },
    ],
  },

  // ============================================================
  // 12. Maiores Caixa
  // ============================================================
  'maiores-caixa': {
    slug: 'maiores-caixa',
    title: 'Maiores Caixa',
    metaTitle: 'Maiores Posições de Caixa da Bolsa B3 2026 | Redentia',
    metaDescription:
      'Top 50 empresas com maior caixa disponível na B3. Saúde financeira, capacidade de aquisições, dividendos extraordinários e resiliência em crises.',
    h1: 'Maiores Posições de Caixa da Bolsa',
    subtitle:
      'As 50 empresas listadas na B3 com maior posição de caixa e equivalentes. Indica saúde financeira, capacidade de aquisições, dividendos extraordinários e resistência a crises.',
    icon: 'i-lucide-banknote',
    iconColor: 'primary',
    badges: [
      { icon: 'i-lucide-refresh-cw', text: 'Atualizado diariamente' },
      { icon: 'i-lucide-database', text: 'Dados B3' },
      { icon: 'i-lucide-trophy', text: 'Top 50' },
      { icon: 'i-lucide-shield', text: 'Resiliência' },
    ],
    columns: ['cash', 'marketCap', 'dy', 'change'],
    fetcher: (service, type) => service.getTopCash(type, 50),
    educationalSections: [
      {
        h2: 'O que mostra esse ranking?',
        paragraphs: [
          'Lista as 50 empresas com maior posição de caixa e equivalentes (caixa, aplicações de curto prazo, títulos liquidez imediata). É uma fotografia da saúde financeira de curto prazo: empresas com muito caixa têm flexibilidade pra investir, fazer aquisições, distribuir dividendos extraordinários ou simplesmente atravessar crises sem problema.',
          'Bancos dominam o ranking por natureza do negócio (depósitos viram caixa). Petrobras e Vale aparecem em ciclos de commodity alto (caixa acumulado em ciclo). Empresas como Itaúsa, B3 e Ambev costumam estar no topo por modelo capital-light que gera caixa em excesso constantemente.',
        ],
      },
      {
        h2: 'Como interpretar o ranking',
        paragraphs: [
          'Caixa alto pode ser bom (flexibilidade) ou ruim (gestão sem ideia do que fazer com o dinheiro). Empresa com R$ 50 bilhões em caixa e ROE de 10 por cento está deixando de gerar valor, esse caixa parado rende menos que o custo de capital. Pra investidor, o ideal é caixa suficiente pra resiliência mais distribuição do excesso via dividendos ou recompras.',
          'Cruze com endividamento. Empresa pode ter R$ 30 bilhões em caixa MAS R$ 80 bilhões em dívida, dívida líquida de R$ 50 bilhões. Posição absoluta de caixa não diz nada sem o contexto da dívida bruta. O indicador mais limpo é dívida líquida (caixa menos dívida) ou dívida líquida sobre EBITDA.',
        ],
      },
      {
        h2: 'Limitações',
        paragraphs: [
          'Bancos sempre vão dominar o ranking porque a natureza do negócio exige caixa elevado (depósitos a vista, regulamentação Basileia, liquidez bancária). Comparar caixa de banco com caixa de uma siderúrgica não faz muito sentido, sempre olhe dentro do mesmo setor.',
          'Caixa pode ser inflado por venda recente de ativos, captação de dívida ou IPO. Sempre olhe a evolução do caixa nos últimos 4 trimestres pra entender se é estrutural (geração operacional) ou eventual (entrada pontual de recursos).',
        ],
      },
    ],
    crossLinks: [
      linkSimuladorAcoes,
      linkPrecoTeto,
      linkDividendYield,
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'Por que ter muito caixa pode ser ruim?',
        a: 'Caixa rende muito pouco (próximo da Selic), normalmente abaixo do retorno esperado dos acionistas. Empresa que acumula caixa sem aplicar destrói valor (custo de oportunidade). O ideal é distribuir o excesso via dividendos ou recomprar ações próprias. Caixa parado por anos sinaliza falta de visão estratégica.',
      },
      {
        q: 'Empresa com muito caixa paga mais dividendos?',
        a: 'Geralmente sim, mas não automaticamente. Depende da política de payout. Empresas como BBSE3 e Itaúsa distribuem o caixa excedente via dividendos. Outras (como algumas tech) mantêm caixa pra aquisições futuras. Olhe o histórico de pagamento e o discurso da gestão pra projetar.',
      },
      {
        q: 'Caixa ou dívida líquida, qual é mais importante?',
        a: 'Dívida líquida (caixa menos dívida bruta) é a métrica mais limpa de saúde financeira. Caixa sozinho pode mascarar endividamento. Empresa com R$ 10 bilhões em caixa e zero dívida tem dívida líquida negativa de R$ 10 bilhões (excelente). Empresa com R$ 10 bilhões em caixa e R$ 40 bilhões em dívida tem dívida líquida positiva de R$ 30 bilhões (alavancada).',
      },
      {
        q: 'Vale buscar empresas com muito caixa em crise?',
        a: 'Sim, porque tem mais chance de atravessar crise sem problema, sem precisar emitir ações ou tomar dívida cara. Em momentos de pânico de mercado, empresas com balanço sólido (caixa alto, dívida baixa) caem menos e se recuperam mais rápido. Pesquisa acadêmica confirma esse efeito de "flight to quality".',
      },
    ],
  },

  // ============================================================
  // 13. Maior Potencial de Upside
  // ============================================================
  'maior-potencial-upside': {
    slug: 'maior-potencial-upside',
    title: 'Maior Potencial de Upside',
    metaTitle: 'Maior Potencial de Upside da Bolsa B3 2026 | Redentia',
    metaDescription:
      'Top 50 ações com maior upside em relação ao preço justo. Combina Fórmula de Graham e Bazin pra mostrar maiores oportunidades de valorização teórica.',
    h1: 'Maior Potencial de Upside',
    subtitle:
      'As 50 ações com maior potencial de valorização teórica em relação ao preço justo, combinando Fórmulas de Graham e Bazin. Lista as oportunidades de maior margem de segurança no momento.',
    icon: 'i-lucide-rocket',
    iconColor: 'positive',
    badges: [
      { icon: 'i-lucide-refresh-cw', text: 'Atualizado diariamente' },
      { icon: 'i-lucide-database', text: 'Dados B3' },
      { icon: 'i-lucide-trophy', text: 'Top 50' },
      { icon: 'i-lucide-target', text: 'Margem de segurança' },
    ],
    columns: ['upsidePct', 'grahamPrice', 'bazinPrice', 'marketCap'],
    fetcher: (service, type) => service.getUpsidePotential(type, 50),
    educationalSections: [
      {
        h2: 'O que é o Upside Teórico?',
        paragraphs: [
          'Upside é a diferença percentual entre o preço atual de uma ação e o preço justo calculado por uma metodologia (Graham, Bazin, DCF, múltiplos). Um upside de 50 por cento significa que a ação precisaria subir 50 por cento pra atingir o preço considerado justo pelos modelos.',
          'É a tradução numérica do conceito de "margem de segurança" cunhado por Benjamin Graham. Quanto maior o upside, maior o desconto e maior o potencial de retorno se a ação convergir pro preço justo. É uma forma estruturada de comparar oportunidades em diferentes setores e tamanhos.',
        ],
      },
      {
        h2: 'Como interpretar o ranking',
        paragraphs: [
          'Upside acima de 30 por cento começa a ser interessante. Acima de 50 por cento sinaliza desconto significativo (vale investigação). Acima de 100 por cento é raro fora de momentos de crise extrema ou empresas com problemas reais (cuidado).',
          'Os números mostrados aqui são teóricos, baseados em fórmulas tradicionais. O mercado pode estar "errado" e dar oportunidade real de comprar barato, ou pode estar precificando algo que as fórmulas não capturam (perda de competitividade, mudança regulatória, problema setorial). Sempre faça leitura crítica dos números.',
        ],
      },
      {
        h2: 'Limitações',
        paragraphs: [
          'Upside calculado por Graham assume LPA e VPA estáveis no longo prazo. Empresas em prejuízo, em transição ou em setores cíclicos podem ter upside enganoso (lucro caiu temporariamente, vai voltar). Sempre cruze com tendência de lucro dos últimos 5 anos.',
          'Convergência ao preço justo pode levar muitos anos, ou nunca acontecer se o mercado estiver corretamente precificando deterioração. Use o upside como triagem, não como garantia. A combinação ideal é upside alto + qualidade dos fundamentos (ROE alto, margem estável, payout sustentável).',
        ],
      },
    ],
    crossLinks: [
      linkPrecoTeto,
      linkDividendYield,
      linkSimuladorAcoes,
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'Como o upside é calculado?',
        a: 'Combinamos as fórmulas de Graham (raiz de 22,5 × LPA × VPA) e Bazin (dividendo anual ÷ 6 por cento) pra estimar preço justo. Upside é a diferença percentual entre preço justo médio e preço atual. Quanto maior, mais "barata" a ação parece pelas metodologias clássicas de value.',
      },
      {
        q: 'Upside alto sempre é boa oportunidade?',
        a: 'Não. Upside alto pode indicar desconto real (oportunidade) ou problema fundamental que as fórmulas não capturam (armadilha). Antes de comprar, investigue o motivo do desconto: setor, governança, perda de market share, virada de ciclo. Use o ranking como filtro inicial, não como decisão automática.',
      },
      {
        q: 'Quanto tempo leva pro upside se concretizar?',
        a: 'Não há regra fixa. Em alguns casos, o mercado reprecifica em meses (após release positivo, mudança de gestão). Em outros, leva anos (mudança de ciclo macro, recuperação setorial). Pesquisas mostram que estratégias de value tem horizonte natural de 3-5 anos pra dar resultado significativo.',
      },
      {
        q: 'Como combinar este ranking com os outros?',
        a: 'Cruze o ranking de upside com o de Buy and Hold (qualidade) e Maiores ROEs. Empresas que aparecem com upside alto E qualidade alta são as melhores oportunidades estatisticamente. Empresas com upside alto MAS qualidade baixa devem ser tratadas como apostas, não como investimento de longo prazo.',
      },
    ],
  },

  // ============================================================
  // 14. Maior Crescimento de Receita (5 anos)
  // ============================================================
  'crescimento-receita-5-anos': {
    slug: 'crescimento-receita-5-anos',
    title: 'Maior Crescimento de Receita (5 anos)',
    metaTitle: 'Maior Crescimento de Receita 5 Anos B3 | Redentia',
    metaDescription:
      'Empresas da B3 que mais cresceram em receita nos últimos 5 anos. CAGR calculado a partir de balanços anuais oficiais. Top 50 atualizados.',
    h1: 'Empresas com Maior Crescimento de Receita em 5 Anos',
    subtitle:
      'CAGR de receita líquida calculado a partir dos balanços anuais oficiais das empresas listadas na B3.',
    icon: 'i-lucide-trending-up',
    iconColor: 'positive',
    badges: [
      { icon: 'i-lucide-bar-chart-3', text: 'CAGR 5 anos' },
      { icon: 'i-lucide-database', text: 'Dados B3' },
      { icon: 'i-lucide-calendar', text: 'Atualizado diariamente' },
      { icon: 'i-lucide-trending-up', text: 'Top crescimento' },
    ],
    columns: ['revenue', 'change', 'marketCap', 'pe'],
    fetcher: (s, type) => s.getRevenueGrowth5Y(type, 50),
    educationalSections: [
      {
        h2: 'O que é CAGR de receita?',
        paragraphs: [
          'CAGR (Compound Annual Growth Rate) é a taxa anual composta de crescimento, métrica que mostra o ritmo médio de expansão de uma variável (receita, lucro, patrimônio) num período de vários anos. A fórmula é simples: pegue o valor final, divida pelo valor inicial, eleve à potência de 1 dividido pelo número de anos e subtraia 1.',
          'No ranking, calculamos o CAGR da receita líquida dos últimos 5 anos a partir dos balanços anuais oficiais. Empresa que faturou R$ 10 bilhões em 2020 e R$ 20 bilhões em 2025 tem CAGR de aproximadamente 14,9 por cento ao ano. Isso suaviza ruídos de um ano específico e mostra tendência estrutural de expansão.',
        ],
      },
      {
        h2: 'Por que crescimento de receita importa?',
        paragraphs: [
          'Crescimento de receita é o motor primário de criação de valor. Sem novas vendas, não há mais lucro pra distribuir, não há mais caixa pra reinvestir e não há aumento de market share. Empresas com CAGR alto tendem a multiplicar valor de mercado no longo prazo, mesmo que o múltiplo (P/L, P/VPA) se mantenha estável.',
          'Investidores de growth investing buscam exatamente isso: empresas que crescem receita acima da média do setor, ganhando espaço de concorrentes. CAGR de 15 por cento ao ano sustentado por uma década dobra a receita aproximadamente a cada 5 anos, efeito de composição que muda escala da empresa por completo.',
        ],
      },
      {
        h2: 'Limitações: alto crescimento nem sempre vira lucro',
        paragraphs: [
          'Crescimento de receita não garante criação de valor. Empresa pode crescer 30 por cento ao ano queimando caixa, oferecendo descontos agressivos ou expandindo via aquisições caras sem sinergia. Sempre cruze CAGR de receita com margem líquida e ROE: o ideal é receita E margem subindo juntas.',
          'Outro ponto: empresas em fase inicial (small caps, tech) costumam crescer rapidamente da base baixa, mas desaceleram conforme amadurecem. CAGR de 30 por cento por 5 anos seguidos é raríssimo e geralmente envolve setores cíclicos, fusões ou efeito base. Use o ranking pra triagem, depois investigue qualidade do crescimento.',
        ],
      },
    ],
    crossLinks: [
      linkPrecoTeto,
      linkSimuladorAcoes,
      {
        to: '/ranking/maiores-receitas',
        icon: 'i-lucide-bar-chart-3',
        title: 'Maiores Receitas',
        sub: 'Ranking pelo tamanho absoluto da receita anual.',
      },
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'O que é CAGR e como é calculado?',
        a: 'CAGR (Compound Annual Growth Rate) é a taxa anual composta de crescimento. Fórmula: (valor_final / valor_inicial)^(1/n_anos) - 1. Exemplo: empresa que faturou R$ 10 bi em 2020 e R$ 20 bi em 2025 (5 anos) tem CAGR de aproximadamente 14,87 por cento. Mostra ritmo médio anual de crescimento, suavizando volatilidade de cada ano.',
      },
      {
        q: 'Qual é uma boa taxa de crescimento de receita?',
        a: 'Depende muito do setor. Em geral, no Brasil, CAGR acima de 10 por cento ao ano já é considerado bom (acima da inflação histórica). Acima de 15 por cento sinaliza crescimento forte. Acima de 25 por cento é excepcional e geralmente vem com volatilidade. Em setores maduros (utilities, bancos), 5-8 por cento já é satisfatório.',
      },
      {
        q: 'Crescimento alto sempre é positivo?',
        a: 'Não automaticamente. Crescimento via aquisições caras pode destruir valor mesmo aumentando receita. Crescimento via descontos agressivos comprime margem e pode levar a prejuízo. Sempre cruze CAGR de receita com margem líquida estável ou crescente. O ideal é receita E rentabilidade subindo juntas, sinal de modelo escalável.',
      },
      {
        q: 'Como comparar empresas de setores diferentes?',
        a: 'Comparação justa só dentro do mesmo setor. Empresa de tecnologia crescendo 25 por cento ao ano é normal; banco crescendo 25 por cento ao ano é excepcional. Use os pares setoriais como benchmark. Cruze também com crescimento do PIB e do setor pra identificar quem está ganhando market share.',
      },
      {
        q: 'CAGR de 5 anos ou de 10 anos, qual é melhor?',
        a: 'CAGR de 5 anos mostra a fase atual da empresa (mais relevante pra decisão de hoje). CAGR de 10 anos mostra resiliência ao ciclo (atravessa pelo menos uma crise). Use 5 anos pra ranking comparativo e 10 anos pra validar consistência de longo prazo. Empresa boa tem CAGR positivo nos dois períodos.',
      },
    ],
  },

  // ============================================================
  // 15. Maior Crescimento de Lucro (5 anos)
  // ============================================================
  'crescimento-lucro-5-anos': {
    slug: 'crescimento-lucro-5-anos',
    title: 'Maior Crescimento de Lucro (5 anos)',
    metaTitle: 'Maior Crescimento de Lucro 5 Anos B3 | Redentia',
    metaDescription:
      'Empresas que mais cresceram em lucro líquido nos últimos 5 anos na B3. Ranking pelo CAGR calculado de balanços anuais. Top 50 atualizados.',
    h1: 'Empresas com Maior Crescimento de Lucro em 5 Anos',
    subtitle:
      'Pelo lucro líquido, ranking calculado por CAGR (taxa de crescimento anual composta) dos últimos 5 balanços.',
    icon: 'i-lucide-trending-up',
    iconColor: 'positive',
    badges: [
      { icon: 'i-lucide-bar-chart-3', text: 'CAGR 5 anos' },
      { icon: 'i-lucide-database', text: 'Dados B3' },
      { icon: 'i-lucide-calendar', text: 'Atualizado diariamente' },
      { icon: 'i-lucide-coins', text: 'Lucro líquido' },
    ],
    columns: ['netIncome', 'revenue', 'marketCap', 'change'],
    fetcher: (s, type) => s.getNetIncomeGrowth5Y(type, 50),
    educationalSections: [
      {
        h2: 'O que esse ranking mostra?',
        paragraphs: [
          'Lista as 50 empresas da B3 com maior CAGR (taxa anual composta de crescimento) do lucro líquido nos últimos 5 anos. O cálculo usa o lucro líquido de cada balanço anual oficial, suavizando picos pontuais e mostrando ritmo estrutural de criação de valor pros acionistas.',
          'É um dos rankings mais relevantes pra investidor de longo prazo. Empresa que cresce lucro 15 por cento ao ano por uma década tende a multiplicar valor de mercado, mesmo sem expansão de múltiplo. CAGR de lucro acima de receita indica ganho de eficiência operacional (margem subindo), sinal poderoso de qualidade.',
        ],
      },
      {
        h2: 'Como interpretar',
        paragraphs: [
          'CAGR de lucro entre 10-15 por cento: bom, próximo da média de empresas saudáveis. CAGR entre 15-25 por cento: muito bom, sinal de empresa em ciclo virtuoso (receita crescendo + margem expandindo + alavancagem operacional). CAGR acima de 25 por cento: excepcional, geralmente envolve recuperação de base baixa ou setor em forte expansão.',
          'Cruze sempre com o CAGR de receita. Lucro crescendo mais que receita significa margem subindo (excelente). Lucro crescendo menos que receita significa margem comprimindo (cuidado). Empresa que dobra lucro com receita estagnada está apenas otimizando custos, ganho não sustentável no infinito.',
        ],
      },
      {
        h2: 'Limitações',
        paragraphs: [
          'CAGR de lucro pode ser distorcido por base baixa ou negativa. Empresa que saiu do prejuízo pra lucro grande tem CAGR matemático imenso ou indefinido. Sempre olhe os números absolutos junto com o CAGR pra contextualizar. Recuperação não é o mesmo que crescimento estrutural.',
          'Itens não recorrentes (venda de ativos, créditos fiscais) inflam o lucro de um ano específico e podem distorcer o CAGR. Olhe o lucro recorrente quando disponível, ou faça a média de 3 anos pra suavizar eventos pontuais. Combine este ranking com o de Maiores Receitas pra validar consistência.',
        ],
      },
    ],
    crossLinks: [
      linkPrecoTeto,
      linkSimuladorAcoes,
      {
        to: '/ranking/maiores-lucros',
        icon: 'i-lucide-coins',
        title: 'Maiores Lucros',
        sub: 'Ranking pelo lucro líquido absoluto dos últimos 12 meses.',
      },
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'Por que CAGR de lucro é mais difícil de manter alto que CAGR de receita?',
        a: 'Lucro depende de margem, e margem tem teto natural (concorrência, custo de matéria prima, salários, impostos). Empresa pode crescer receita em 20 por cento por décadas, mas crescer lucro em 20 por cento por décadas exige expansão contínua de margem, raríssimo. Por isso CAGR de lucro alto sustentado por anos é forte sinal de qualidade.',
      },
      {
        q: 'CAGR de lucro pode ser maior que CAGR de receita?',
        a: 'Sim, e é o cenário mais desejável. Significa que a empresa está ganhando alavancagem operacional, ou seja, custos crescem menos que receita e a margem se expande. Tipicamente acontece em empresas escaláveis (software, marketplaces) ou em fase de maturação onde custos fixos diluem.',
      },
      {
        q: 'O que faz uma empresa crescer lucro consistentemente?',
        a: 'Combinação de fatores: vantagem competitiva (marca, custo, switching cost), expansão de market share, eficiência operacional (margem subindo), alocação inteligente de capital (recompras, dividendos, aquisições com sinergia), gestão experiente. Empresas com CAGR alto sustentado tem pelo menos 3-4 desses pilares.',
      },
      {
        q: 'Como diferenciar CAGR de qualidade vs CAGR de base baixa?',
        a: 'CAGR de qualidade vem de receita crescente E margem estável ou expandindo. CAGR de base baixa vem de recuperação após um ano ruim (prejuízo, queda de margem). Olhe sempre o lucro absoluto ano a ano. Empresa que saiu de R$ 100 milhões pra R$ 1 bilhão tem CAGR aparentemente lindo, mas pode ser apenas normalização.',
      },
      {
        q: 'Vale a pena comprar empresa com CAGR de lucro acima de 30 por cento?',
        a: 'Geralmente sim, MAS com cuidado. Esse ritmo é raríssimo de manter por mais de 3-5 anos. Antes de comprar, investigue: o crescimento é real (não contábil), o setor é estruturalmente crescente, o múltiplo já não está precificando isso. Empresa caríssima com CAGR alto pode ainda subir, mas a margem de segurança é baixa.',
      },
    ],
  },

  // ============================================================
  // 16. Empresas que Nunca Tiveram Prejuízo (5+ anos)
  // ============================================================
  'nunca-tiveram-prejuizo': {
    slug: 'nunca-tiveram-prejuizo',
    title: 'Empresas que Nunca Tiveram Prejuízo (5+ anos)',
    metaTitle: 'Empresas Nunca Tiveram Prejuízo B3 | Redentia',
    metaDescription:
      'Empresas da B3 que mantiveram lucro líquido positivo todos os anos nos últimos 5+ anos. Ativos resilientes ao ciclo econômico. Top 50.',
    h1: 'Empresas que Nunca Tiveram Prejuízo (Últimos 5+ Anos)',
    subtitle:
      'Ativos resilientes ao ciclo econômico que mantiveram lucro positivo em todos os balanços anuais dos últimos 5 anos ou mais.',
    icon: 'i-lucide-shield-check',
    iconColor: 'positive',
    badges: [
      { icon: 'i-lucide-shield-check', text: 'Resiliência' },
      { icon: 'i-lucide-database', text: 'Dados B3' },
      { icon: 'i-lucide-calendar-check', text: '5+ anos seguidos' },
      { icon: 'i-lucide-trophy', text: 'Top 50' },
    ],
    columns: ['netIncome', 'roe', 'marketCap', 'dy'],
    fetcher: (s, type) => s.getNeverLoss(type, 50),
    educationalSections: [
      {
        h2: 'Por que ausência de prejuízo importa?',
        paragraphs: [
          'Empresa que mantém lucro positivo por 5+ anos seguidos atravessou pelo menos um ciclo econômico difícil sem ficar no vermelho. Isso é um filtro de qualidade poderoso: separa negócios resilientes (modelo de receita previsível, baixa alavancagem operacional, gestão prudente) de negócios voláteis que oscilam entre lucro e prejuízo conforme o vento muda.',
          'Pra investidor de buy and hold, essa consistência reduz drasticamente o risco. Quando uma empresa nunca teve prejuízo nos últimos 5-10 anos, a chance de ter prejuízo no próximo é estatisticamente menor que de uma empresa cíclica. Não elimina o risco (qualquer empresa pode ter ano ruim), mas inclina a probabilidade pro lado favorável.',
        ],
      },
      {
        h2: 'Setores típicos que aparecem',
        paragraphs: [
          'Bancos e seguradoras dominam por modelo de receita estável (juros, prêmios, taxas). Utilities (energia, saneamento) também aparecem com frequência por contratos de longo prazo regulados. Bolsas (B3SA3) e marketplaces consolidados costumam estar na lista por modelo capital-light com receita recorrente.',
          'Já varejo, construção, commodities e empresas cíclicas raramente aparecem. Vale e Petrobras tem histórico de prejuízo em ciclos ruins de minério ou petróleo, mesmo sendo gigantes. Pra carteira defensiva (aposentadoria, renda passiva), priorize ativos deste ranking sobre empresas cíclicas.',
        ],
      },
      {
        h2: 'Limitações',
        paragraphs: [
          'Lucro positivo não significa lucro suficiente. Empresa pode ter lucro irrisório em relação ao patrimônio (ROE baixo) e ainda assim aparecer no ranking. Sempre cruze com ROE e crescimento de lucro pra distinguir empresa "estável boa" de empresa "estável medíocre". O ideal é ausência de prejuízo + ROE acima de 15 por cento.',
          'Histórico passado não garante futuro. Empresa pode ter mantido lucro por 10 anos e ter prejuízo no 11º por mudança regulatória, choque setorial ou má gestão. Use este ranking como filtro de triagem, depois faça análise atual da tese (margens, dívida, contexto setorial) antes de decidir entrar.',
        ],
      },
    ],
    crossLinks: [
      linkPrecoTeto,
      linkDividendYield,
      {
        to: '/ranking/buy-and-hold',
        icon: 'i-lucide-shield-check',
        title: 'Buy and Hold (Score)',
        sub: 'Ranking de qualidade combinado pra estratégia de longo prazo.',
      },
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'Por que algumas empresas nunca têm prejuízo?',
        a: 'Geralmente é combinação de: modelo de receita previsível (contratos, recorrência, regulação), baixa alavancagem operacional (custos variáveis em vez de fixos), gestão financeira prudente (caixa alto, dívida baixa), setor com barreiras de entrada (bancos, utilities reguladas). Quando esses pilares estão presentes, a empresa absorve choques sem ficar no vermelho.',
      },
      {
        q: 'Vale a pena pagar mais caro por empresa que nunca teve prejuízo?',
        a: 'Sim, e o mercado costuma cobrar premium por isso. Empresas resilientes negociam P/L acima da média do setor justamente por ter risco menor. Pra investidor de buy and hold ou aposentadoria, esse premium se justifica. Pra investidor focado em retorno máximo, o premium reduz upside.',
      },
      {
        q: 'Como combinar este ranking com Buy and Hold?',
        a: 'Empresas que aparecem nos dois rankings são as candidatas mais sólidas pra carteira de longo prazo. Aqui você filtra resiliência (sem prejuízo). No Buy and Hold, filtra qualidade (ROE alto, dividendo consistente, dívida controlada). Interseção das duas listas é o universo de "core positions" defensivas.',
      },
      {
        q: 'Esse ranking funciona pra FIIs?',
        a: 'FIIs distribuem rendimentos mensais (não tem conceito clássico de prejuízo), então o ranking foca em ações e ETFs. Pra FIIs, o equivalente é checar histórico de distribuição: FIIs que pagaram rendimento todos os meses por 5+ anos sem interrupção tem mesmo perfil de resiliência.',
      },
      {
        q: 'Como saber se uma empresa pode ter prejuízo no futuro?',
        a: 'Sinais de alerta: queda consecutiva de margem, dívida crescendo mais que EBITDA, perda de market share, mudança regulatória adversa, troca frequente de gestão, queda de demanda estrutural no setor. Acompanhe releases trimestrais e revise a tese se vários sinais aparecerem juntos.',
      },
    ],
  },

  // ============================================================
  // 17. Tickers Mais Mencionados em Notícias (30 dias)
  // ============================================================
  'mais-aparece-noticias': {
    slug: 'mais-aparece-noticias',
    title: 'Tickers Mais Mencionados em Notícias (30 dias)',
    metaTitle: 'Tickers Mais Citados em Notícias B3 | Redentia',
    metaDescription:
      'Ações e FIIs mais mencionados em notícias do mercado financeiro brasileiro nos últimos 30 dias. Termômetro de atenção do investidor.',
    h1: 'Tickers Mais Mencionados em Notícias (Últimos 30 Dias)',
    subtitle:
      'Termômetro de atenção do mercado: ações e FIIs com mais menções em portais de notícias financeiras nos últimos 30 dias.',
    icon: 'i-lucide-newspaper',
    iconColor: 'primary',
    badges: [
      { icon: 'i-lucide-newspaper', text: 'Notícias 30 dias' },
      { icon: 'i-lucide-database', text: 'Múltiplos portais' },
      { icon: 'i-lucide-calendar', text: 'Atualizado diariamente' },
      { icon: 'i-lucide-radio', text: 'Buzz do mercado' },
    ],
    columns: ['change', 'marketCap', 'dy', 'pe'],
    fetcher: (s, type) => s.getNewsMentions(type, 50, 30),
    educationalSections: [
      {
        h2: 'O que esse ranking mostra?',
        paragraphs: [
          'Lista os 50 tickers (ações e FIIs) com maior número de menções em notícias do mercado financeiro brasileiro nos últimos 30 dias. Cada matéria que cita o ticker (release de balanço, fato relevante, análise de casa de research, comentário de mercado) entra na contagem. É o termômetro mais direto de atenção do investidor e da imprensa.',
          'Empresas no topo costumam estar passando por algo relevante: divulgação de resultado, fusão ou aquisição, mudança de gestão, mudança regulatória que afeta o setor, ou simplesmente forte oscilação de preço que chama atenção da mídia. Acompanhar esse ranking ajuda a captar narrativas de mercado em tempo real.',
        ],
      },
      {
        h2: 'Por que prestar atenção em menções?',
        paragraphs: [
          'Atenção da mídia muitas vezes precede ou acompanha movimento de preço. Empresa que de repente aparece em todas as manchetes financeiras tende a ter maior volatilidade nos dias seguintes (boa notícia ou má notícia). Pra investidor ativo, isso é oportunidade de identificar catalisadores antes do mercado precificar completamente.',
          'Buzz alto também sinaliza upcoming catalysts: vésperas de resultado trimestral, reuniões com analistas, conferências de investidores, mudanças regulatórias em discussão. Combinar buzz com fundamentos sólidos pode ajudar a posicionar antes de movimento esperado.',
        ],
      },
      {
        h2: 'Riscos do hype trading',
        paragraphs: [
          'Cuidado com o efeito manada. Ticker que aparece em todas as manchetes pode atrair fluxo especulativo de curto prazo (FOMO), causando overshoot do preço acima do valor fundamentado. Comprar pelo buzz isolado é estratégia perigosa, pode ser entrada no topo de movimento de curto prazo.',
          'Outro risco: notícia ruim também conta como menção. Empresa pode estar nos holofotes por escândalo de governança, problema regulatório ou fraude descoberta. Sempre leia o tipo de notícia antes de associar buzz a oportunidade. Use este ranking como ponto de partida pra investigação, nunca como decisão direta.',
        ],
      },
    ],
    crossLinks: [
      {
        to: '/help',
        icon: 'i-lucide-message-circle',
        title: 'Pergunte ao assistente',
        sub: 'Use a IA da Redentia pra resumir o que está acontecendo com qualquer ticker.',
      },
      linkSimuladorAcoes,
      {
        to: '/ranking/maiores-altas-mes',
        icon: 'i-lucide-trending-up',
        title: 'Maiores Altas (30 dias)',
        sub: 'Cruze atenção com performance recente pra identificar movimentos.',
      },
      linkOutrosRankings,
    ],
    faqItems: [
      {
        q: 'Como o número de menções é calculado?',
        a: 'A Redentia coleta diariamente notícias de portais financeiros brasileiros (InfoMoney, Money Times, Valor, Brazil Journal, Suno, etc.) e conta quantas matérias citam cada ticker nos últimos 30 dias. Quanto mais menções, maior a posição no ranking. Atualizado diariamente.',
      },
      {
        q: 'Por que algumas ações pequenas aparecem entre as mais mencionadas?',
        a: 'Notícia específica pode catapultar uma small cap pro topo: descoberta de fraude, fusão anunciada, novo contrato relevante, mudança de controle. Isso costuma ser pontual (poucos dias) e some quando o assunto perde calor. Acompanhar o ranking ao longo das semanas mostra quem é buzz duradouro vs ruído passageiro.',
      },
      {
        q: 'Buzz alto significa que devo comprar?',
        a: 'Não automaticamente. Buzz é informação sobre atenção, não sobre qualidade ou preço justo. Use o ranking pra descobrir o que está movimentando o mercado, depois investigue a tese fundamental antes de qualquer decisão. Comprar só pelo hype é estratégia de curto prazo com alta volatilidade.',
      },
      {
        q: 'Qual é a diferença entre menções positivas e negativas?',
        a: 'O ranking conta TODAS as menções, sem distinguir tom. Empresa em escândalo pode dominar manchetes (menções negativas) tanto quanto empresa em alta de fato relevante (menções positivas). Sempre leia as matérias do topo do ranking pra entender o contexto antes de tirar conclusão.',
      },
      {
        q: 'Como combinar buzz com fundamentos?',
        a: 'Estratégia comum: filtrar tickers do ranking de buzz que TAMBÉM aparecem em rankings de qualidade (Buy and Hold, ROE alto, lucro consistente). Buzz alto + fundamentos sólidos = catalisador potencial pra valorização. Buzz alto + fundamentos fracos = especulação ou problema real, evitar.',
      },
    ],
  },
}

// ----- Resolve config -----------------------------------------------

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const config = computed<RankingConfig>(() => {
  const found = RANKINGS_INFO[slug.value]
  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Ranking não encontrado' })
  }
  return found
})

// ----- Layout / brand -----------------------------------------------

const brand = useBrand()

// Icone color/bg derivados do iconColor declarado na config. Mantemos
// 3 cores semanticas (primary/positive/negative) pra contraste consistente.
const iconColor = computed(() => {
  switch (config.value.iconColor) {
    case 'positive': return 'var(--brand-positive)'
    case 'negative': return 'var(--brand-negative)'
    default: return 'var(--brand-primary)'
  }
})

const iconBg = computed(() => {
  switch (config.value.iconColor) {
    case 'positive': return 'color-mix(in srgb, var(--brand-positive) 14%, transparent)'
    case 'negative': return 'color-mix(in srgb, var(--brand-negative) 14%, transparent)'
    default: return 'color-mix(in srgb, var(--brand-primary) 14%, transparent)'
  }
})

// ----- Tabs ---------------------------------------------------------

// AtomsSegmented exige value string|number, entao usamos 'all' como
// sentinel para "sem filtro" e convertemos pra null antes de chamar o
// fetcher (TickerType ainda aceita null no nivel do service).
type TickerFilter = 'all' | 'STOCK' | 'REIT' | 'ETF' | 'BDR'

const tabs: Array<{ label: string; value: TickerFilter }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Ações', value: 'STOCK' },
  { label: 'FIIs', value: 'REIT' },
  { label: 'ETFs', value: 'ETF' },
]

const activeType = ref<TickerFilter>('all')

// ----- Data fetch ---------------------------------------------------

const service = useAssetsService()

const { data: rows, pending } = await useAsyncData(
  () => `ranking-${slug.value}-${activeType.value}`,
  () => config.value.fetcher(service, activeType.value === 'all' ? null : activeType.value),
  {
    watch: [activeType],
    default: () => [],
  },
)

// ----- SEO ----------------------------------------------------------

// itemListEntries: top 10 dos rows pra ItemList schema. Vazio enquanto
// rows carrega; estrutura preenchida automaticamente quando os dados
// chegam. Limita a 10 pra evitar bloat de schema.
const itemListEntries = computed(() => {
  const list = rows.value || []
  return list.slice(0, 10).map((row: any, idx: number) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: `${row.ticker} ${row.name ? `- ${row.name}` : ''}`.trim(),
    url: `/asset/${(row.ticker || '').toLowerCase()}`,
  }))
})

usePageSeo({
  title: () => config.value.metaTitle,
  description: () => config.value.metaDescription,
  path: `/ranking/${slug.value}`,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Rankings', path: '/ranking' },
    { name: config.value.title, path: `/ranking/${slug.value}` },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `${config.value.title} - ${brand.name}`,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Ranking de ativos',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      description: config.value.metaDescription,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: config.value.faqItems.map((item) => ({
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
            name: `${config.value.title} - Top 10`,
            itemListOrder: 'https://schema.org/ItemListOrderDescending',
            numberOfItems: itemListEntries.value.length,
            itemListElement: itemListEntries.value,
          },
        ]
      : []),
  ],
})
</script>

<template>
  <NuxtLayout :name="layoutName" :title="scenario.h1">
    <article class="calc-v5">
      <div class="calc-atmo calc-atmo-top" aria-hidden="true" />
      <div class="calc-atmo calc-atmo-bottom" aria-hidden="true" />

      <div class="calc-status">
        <span class="flex items-center gap-2">
          <span class="relative flex size-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span class="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Simulador ao vivo
        </span>
        <span aria-hidden>·</span>
        <span>Atualizado {{ lastUpdatedText }}</span>
        <span aria-hidden>·</span>
        <NuxtLink to="/calculadora/quanto-investir" class="calc-back">← Calculadora de Aporte Mensal</NuxtLink>
      </div>

      <header class="calc-hero">
        <p class="calc-eyebrow">Cenário · Quanto Investir</p>
        <h1 class="calc-title">{{ scenario.h1 }}</h1>
        <p class="calc-lead">{{ scenario.answerFirst }}</p>
        <ul class="calc-chips">
          <li
            v-for="badge in scenario.badges"
            :key="badge.label"
          >
            <span class="dot" :style="badge.color ? { background: badge.color } : undefined" />
            {{ badge.label }}
          </li>
        </ul>
      </header>
    </article>

    <section class="calc-aux flex flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8">
      <!-- Calculadora pre-preenchida via query params (redirect on mount) -->
      <CalculatorMonthlyInvestment />

      <!-- Outros cenários populares (cross-link siblings) -->
      <div
        class="flex flex-col gap-3 rounded-[30px] border p-6"
        :style="{
          backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
          borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
        }"
      >
        <h2>Outros cenários populares</h2>
        <p class="text-sm">
          Compare aporte mensal exigido para metas diferentes, basta clicar e a calculadora carrega já preenchida.
        </p>
        <div class="grid grid-cols-1 gap-2 md:grid-cols-3">
          <NuxtLink
            v-for="rel in relatedScenarios"
            :key="rel.slug"
            :to="`/calculadora/quanto-investir/${rel.slug}`"
            class="group flex min-h-[44px] items-center gap-3 rounded-md border px-3 py-3 transition hover:border-secondary/40 hover:bg-secondary/10 sm:flex-col sm:items-start sm:gap-0.5 sm:rounded-xl"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <span class="flex items-center gap-1.5 text-sm font-medium">
              <UIcon name="i-lucide-arrow-right" class="size-4 text-secondary" />
              {{ rel.h1 }}
            </span>
            <span class="text-[11px] line-clamp-2" :style="{ color: 'var(--brand-text-muted)' }">
              {{ rel.preview }}
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- Conteúdo Educacional Focado no Cenário -->
      <div class="max-w-none flex flex-col gap-4">
        <h2>{{ scenario.eduH2 }}</h2>
        <div
          v-for="block in scenario.eduBlocks"
          :key="block.h3"
          class="flex flex-col gap-2"
        >
          <h3>{{ block.h3 }}</h3>
          <p
            v-for="(p, i) in block.paragraphs"
            :key="i"
            class="leading-relaxed"
          >
            {{ p }}
          </p>
        </div>
      </div>

      <!-- FAQ específico do cenário -->
      <div class="flex flex-col gap-3">
        <h2>Perguntas frequentes sobre este cenário</h2>
        <div class="space-y-3">
          <details
            v-for="item in scenario.faq"
            :key="item.q"
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              {{ item.q }}
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              {{ item.a }}
            </p>
          </details>
        </div>
      </div>

      <!-- CTA -->
      <MoleculesCtaSection
        :title="`Acompanhe sua meta na ${brand.name}`"
        description="Cadastre-se para monitorar o progresso da sua meta com gráficos e análises em tempo real."
        :buttons="[
          { label: 'Criar conta grátis', to: '/auth/register', icon: 'i-lucide-arrow-right', variant: 'primary' },
          { label: 'Voltar para a calculadora', to: '/calculadora/quanto-investir', variant: 'outline' },
        ]"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
// ====================================================================
// Path-based long-tail landing pages — /calculadora/quanto-investir/[scenario].
// Cada slug é um canonical próprio que o Google indexa como página
// independente. Long-tails miradas: "quanto investir pra ter 1 milhao",
// "aporte mensal entrada imovel", "quanto investir aposentadoria 25 anos".
// ====================================================================

interface ScenarioFaq {
  q: string
  a: string
}

interface ScenarioBadge {
  label: string
  icon: string
  color?: string
}

interface ScenarioBlock {
  h3: string
  paragraphs: string[]
}

interface ScenarioConfig {
  h1: string
  title: string
  metaDescription: string
  answerFirst: string
  preview: string
  badges: ScenarioBadge[]
  inputs: { goal: number; years: number; wealth: number; rate: number }
  eduH2: string
  eduBlocks: ScenarioBlock[]
  faq: ScenarioFaq[]
  related: string[]
}

const baseBadges: ScenarioBadge[] = [
  { label: '100% gratuito', icon: 'i-lucide-check-circle', color: 'var(--brand-positive)' },
  { label: 'Cálculo instantâneo', icon: 'i-lucide-zap' },
  { label: 'Cálculo reverso por meta', icon: 'i-lucide-target' },
  { label: 'Link compartilhável', icon: 'i-lucide-share-2' },
]

const scenarios: Record<string, ScenarioConfig> = {
  'juntar-1-milhao': {
    h1: 'Quanto Investir por Mês Pra Juntar R$ 1 Milhão?',
    title: 'Quanto Investir por Mês Pra Juntar R$ 1 Milhão?',
    metaDescription: 'Para juntar R$ 1 milhão em 20 anos a 10% a.a. invista R$ 1.321/mês. Em 30 anos, R$ 442/mês. Calcule grátis sem cadastro.',
    answerFirst:
      'Para juntar R$ 1 milhão em 20 anos a 10% ao ano, você precisa investir R$ 1.321 por mês. Em 30 anos cai para R$ 442/mês. Em 15 anos sobe para R$ 2.404/mês. Em 10 anos, R$ 4.825/mês. A fórmula usada é PMT = (FV − PV(1+i)ⁿ) ÷ [((1+i)ⁿ − 1) ÷ i], onde FV é a meta, PV o patrimônio atual, i a taxa mensal e n os meses. Cada década adicional ao prazo divide o aporte exigido em quase 50%.',
    preview: 'R$ 1 milhão em 20 anos: R$ 1.321/mês a 10%.',
    badges: baseBadges,
    inputs: { goal: 1000000, years: 20, wealth: 0, rate: 10 },
    eduH2: 'R$ 1 milhão: o efeito do prazo no aporte mensal',
    eduBlocks: [
      {
        h3: 'Por que R$ 1 milhão é a meta mais buscada do Brasil',
        paragraphs: [
          'R$ 1 milhão é a meta psicológica mais comum porque marca o limiar entre "investidor amador" e "patrimônio relevante". Pela regra dos 4%, gera renda passiva sustentável de R$ 3.333/mês, suficiente para Lean FIRE (vida frugal) ou complemento confortável ao INSS. Para a maioria dos brasileiros é a primeira meta de longo prazo realista.',
          'Atingir R$ 1 milhão depende quase totalmente do prazo escolhido. Em 5 anos exige R$ 12.880/mês (aporte alto, viável só para alta renda). Em 10 anos, R$ 4.825/mês. Em 15 anos, R$ 2.404/mês. Em 20 anos, R$ 1.321/mês. Em 25 anos, R$ 745/mês. Em 30 anos, apenas R$ 442/mês. A diferença entre 10 e 30 anos é uma redução de 91% no aporte exigido.',
        ],
      },
      {
        h3: 'Estratégia para acumular R$ 1 milhão',
        paragraphs: [
          'Comece o quanto antes. Quem tem 25 anos pode atingir R$ 1 milhão com R$ 442/mês durante 30 anos. Quem espera os 35, precisa de R$ 745/mês por 25 anos. Aos 45 já são R$ 2.404/mês durante 15 anos, esforço bem maior. Cada década perdida triplica ou quadruplica o aporte mensal exigido.',
          'Carteira diversificada com 60-70% renda variável (Bolsa Brasil, ETFs internacionais, FIIs) e 30-40% renda fixa (Tesouro IPCA+, CDBs prefixados longos) historicamente entrega 10-12% a.a. no longo prazo. Reinvista todos os dividendos e ajuste o aporte conforme sua renda cresce, manter aporte fixo por décadas é abrir mão do principal acelerador.',
        ],
      },
    ],
    faq: [
      {
        q: 'Quanto investir por mês pra juntar R$ 1 milhão em 10 anos?',
        a: 'A 10% a.a., R$ 4.825/mês. A 12% a.a., R$ 4.348/mês. Total de aportes em 10 anos: R$ 521-579 mil. Total de juros: R$ 421-479 mil. Aporte alto, viável apenas para alta renda ou casal investindo em conjunto.',
      },
      {
        q: 'Quanto investir por mês pra juntar R$ 1 milhão em 20 anos?',
        a: 'A 10% a.a., R$ 1.321/mês. A 12% a.a., R$ 1.011/mês. Total de aportes em 20 anos: R$ 243-317 mil. Total de juros: R$ 683-757 mil. Cenário mais comum, equilibra esforço mensal e prazo.',
      },
      {
        q: 'Quanto investir por mês pra juntar R$ 1 milhão em 30 anos?',
        a: 'A 10% a.a., R$ 442/mês. A 12% a.a., R$ 286/mês. Total de aportes em 30 anos: R$ 103-159 mil. Total de juros: R$ 841-897 mil. Cenário ideal para quem começa cedo, juros respondem por 84-90% do patrimônio.',
      },
      {
        q: 'Já tenho R$ 100 mil acumulados, quanto preciso aportar?',
        a: 'R$ 100 mil iniciais aplicados a 10% a.a. crescem sozinhos para R$ 672 mil em 20 anos. Ou seja, faltam apenas R$ 328 mil para atingir R$ 1 milhão, exigindo aporte mensal de R$ 433 (em vez de R$ 1.321 começando do zero). Patrimônio inicial é multiplicador poderoso.',
      },
      {
        q: 'R$ 1 milhão dá pra viver de renda?',
        a: 'Pela regra dos 4%, R$ 1 milhão gera R$ 3.333/mês de renda passiva sustentável. Equivale a Lean FIRE no Brasil (vida frugal em cidades médias) ou complemento ao INSS. Para padrão classe média confortável (R$ 6-8 mil/mês), você precisa de R$ 1,8-2,4 milhões.',
      },
    ],
    related: ['juntar-100-mil', 'aposentadoria-2-milhoes', 'entrada-imovel'],
  },

  'juntar-100-mil': {
    h1: 'Quanto Investir Pra Ter R$ 100 Mil em 5 Anos?',
    title: 'Quanto Investir Pra Ter R$ 100 Mil em 5 Anos?',
    metaDescription: 'Para juntar R$ 100 mil em 5 anos a 10% a.a. invista R$ 1.288/mês. Em 10 anos, R$ 482/mês. Ideal para meta de curto prazo. Calcule.',
    answerFirst:
      'Para juntar R$ 100 mil em 5 anos a 10% ao ano, você precisa investir R$ 1.288 por mês. Em 10 anos, o aporte cai para R$ 482/mês. Em 3 anos, sobe para R$ 2.358/mês. Em 7 anos, fica em R$ 815/mês. Total de aportes em 5 anos: R$ 77.280. Total de juros: R$ 22.720. Em metas de curto e médio prazo, os juros têm peso menor (23% do patrimônio final em 5 anos), o esforço mensal predomina.',
    preview: 'R$ 100 mil em 5 anos: R$ 1.288/mês a 10%.',
    badges: baseBadges,
    inputs: { goal: 100000, years: 5, wealth: 0, rate: 10 },
    eduH2: 'R$ 100 mil em 5 anos: meta tangível e atingível',
    eduBlocks: [
      {
        h3: 'Por que R$ 100 mil é a meta-âncora ideal',
        paragraphs: [
          'R$ 100 mil é a meta-âncora perfeita para quem está começando a investir com seriedade. É grande o suficiente para mudar a vida (entrada de imóvel, troca de carro à vista, reserva de oportunidade), mas atingível em 5-10 anos com disciplina razoável. Cria o hábito do investimento contínuo sem pedir sacrifício extremo.',
          'Em 5 anos a 10% a.a., R$ 1.288/mês entrega exatamente R$ 100 mil. Esse aporte equivale a 10-25% da renda para quem ganha entre R$ 5 mil e R$ 12 mil/mês, dentro da faixa recomendada pela regra 50/30/20. É a primeira escala de patrimônio onde se vê o efeito dos juros compostos atuando de verdade.',
        ],
      },
      {
        h3: 'Onde alocar para R$ 100 mil em 5 anos',
        paragraphs: [
          'Estratégia conservadora (recomendada): 70% Tesouro Selic ou CDB pós-fixado de banco médio com FGC, 20% Tesouro IPCA+ 2029 (proteção de inflação no horizonte exato), 10% LCI/LCA isenta de IR. Resultado esperado: 10-11% a.a. líquido após IR de 17,5-15% (alíquota cai com tempo).',
          'Para horizonte de 5 anos evite alocação alta em renda variável. Crises podem cortar 30-50% do valor de mercado e você não tem tempo de esperar a recuperação. Se quiser aceitar algum risco moderado, limite ações e FIIs a 15-20% da carteira, complementando os 80-85% em renda fixa.',
        ],
      },
    ],
    faq: [
      {
        q: 'Quanto investir por mês pra ter R$ 100 mil em 3 anos?',
        a: 'A 10% a.a., R$ 2.358/mês. A 12% a.a., R$ 2.279/mês. Total de aportes: R$ 82-85 mil. Total de juros: R$ 15-18 mil. Prazo curto demais para juros compostos render bastante, esforço mensal alto.',
      },
      {
        q: 'Quanto investir por mês pra ter R$ 100 mil em 5 anos?',
        a: 'A 10% a.a., R$ 1.288/mês. A 12% a.a., R$ 1.227/mês. Total de aportes: R$ 73-77 mil. Total de juros: R$ 23-27 mil. Equilíbrio razoável entre aporte e tempo, cenário mais buscado.',
      },
      {
        q: 'Quanto investir por mês pra ter R$ 100 mil em 10 anos?',
        a: 'A 10% a.a., R$ 482/mês. A 12% a.a., R$ 432/mês. Total de aportes: R$ 52-58 mil. Total de juros: R$ 42-48 mil. Esticar o prazo de 5 para 10 anos divide o aporte exigido em ~63%.',
      },
      {
        q: 'Onde investir pra juntar R$ 100 mil em 5 anos com segurança?',
        a: 'Carteira conservadora: 70% Tesouro Selic ou CDBs pós-fixados de bancos médios com FGC, 20% Tesouro IPCA+ 2029, 10% LCI/LCA isentas. Evite ações e FIIs concentrados, volatilidade não compensa em prazo tão curto. Ouro físico ou criptos também não fazem sentido aqui.',
      },
      {
        q: 'Vale a pena fazer financiamento ao invés de juntar R$ 100 mil?',
        a: 'Geralmente compensa juntar antes. Financiar imóvel sem entrada paga juros bancários de CDI+1-3% a.a. sobre o valor total do bem, o que vira centenas de milhares de reais ao longo do tempo. Juntar 80% antes e financiar 20% reduz juros totais em R$ 100-300 mil dependendo do imóvel.',
      },
    ],
    related: ['juntar-1-milhao', 'entrada-imovel', 'aposentadoria-2-milhoes'],
  },

  'entrada-imovel': {
    h1: 'Quanto Investir por Mês Pra Dar Entrada em Imóvel?',
    title: 'Quanto Investir Pra Dar Entrada em Imóvel?',
    metaDescription: 'Para juntar R$ 80 mil de entrada em 4 anos com R$ 10 mil iniciais, invista R$ 1.300/mês a 10% a.a. Calcule grátis sua entrada.',
    answerFirst:
      'Para juntar R$ 80 mil de entrada de imóvel em 4 anos partindo de R$ 10 mil já acumulados a 10% ao ano, você precisa investir aproximadamente R$ 1.300 por mês. A entrada típica no Brasil é 20% do valor do imóvel, então R$ 80 mil cobre imóveis de até R$ 400 mil. Dependendo do programa (Casa Verde Amarela, financiamento direto), a entrada pode cair para 10-15%, reduzindo a meta. Calculadora simula o cenário base, ajuste meta e prazo conforme seu projeto.',
    preview: 'R$ 80 mil de entrada em 4 anos: R$ 1.300/mês.',
    badges: baseBadges,
    inputs: { goal: 80000, years: 4, wealth: 10000, rate: 10 },
    eduH2: 'Entrada de imóvel: quanto e por quanto tempo investir',
    eduBlocks: [
      {
        h3: 'Quanto de entrada o banco exige no Brasil',
        paragraphs: [
          'O sistema financeiro de habitação brasileiro tipicamente financia 70-80% do valor do imóvel via SFH (Sistema Financeiro de Habitação) ou SFI (Sistema Financeiro Imobiliário). A entrada padrão é 20-30% do valor avaliado. Para imóveis de R$ 400 mil isso significa entrada de R$ 80-120 mil. Programas habitacionais (MCMV, Casa Verde Amarela) reduzem entrada para 10-15% para faixas de renda específicas.',
          'Além da entrada, considere outros custos imediatos: ITBI (2-3% do valor do imóvel), registro em cartório (1-1,5%), avaliação bancária (R$ 3-5 mil), seguro DFI obrigatório, taxa de avaliação. Para imóvel de R$ 400 mil, esses custos podem somar R$ 15-20 mil adicionais. Mire em juntar entrada + 5-7% do valor do imóvel para custos indiretos.',
        ],
      },
      {
        h3: 'Estratégia de investimento para entrada',
        paragraphs: [
          'Como o horizonte é curto (3-5 anos típicos), a alocação deve ser quase totalmente em renda fixa de baixo risco. Sugestão: 60% Tesouro Selic (liquidez diária), 30% CDB pós-fixado de banco médio com FGC, 10% Tesouro IPCA+ 2026-2028 para travar parte da rentabilidade contra inflação imobiliária.',
          'Lembre que custo do m² imóvel sobe junto com inflação, às vezes mais rápido que CDI. Se você está acumulando há 5+ anos sem comprar, recalcule a meta original, R$ 80 mil de hoje pode comprar imóvel menor que R$ 80 mil de 3 anos atrás. Tesouro IPCA+ ajuda a preservar o poder de compra contra inflação imobiliária específica.',
        ],
      },
    ],
    faq: [
      {
        q: 'Quanto preciso de entrada pra comprar imóvel de R$ 300 mil?',
        a: 'Entrada típica de 20% = R$ 60 mil. Programas habitacionais aceitam 10-15% = R$ 30-45 mil. Some R$ 15-20 mil de custos indiretos (ITBI, registro, avaliação). Total realista: R$ 50-80 mil para entrar em imóvel de R$ 300 mil. Em 4 anos a 10% a.a., aporte exigido: R$ 800-1.300/mês.',
      },
      {
        q: 'Quanto preciso de entrada pra comprar imóvel de R$ 500 mil?',
        a: 'Entrada típica de 20% = R$ 100 mil. Considere também R$ 25-35 mil de custos indiretos (ITBI 2,5%, registro 1,5%, avaliação, seguros). Total: R$ 125-135 mil. Em 5 anos a 10% a.a., exige aporte de R$ 1.700-1.900/mês começando do zero.',
      },
      {
        q: 'Vale a pena pagar mais entrada e financiar menos?',
        a: 'Quase sempre compensa. Cada R$ 10 mil de entrada extra economiza R$ 12-25 mil em juros ao longo do financiamento de 30 anos (depende da taxa CDI+ contratada). Mire em entrada de 30-40% se possível, reduz juros totais em ~30% e parcela mensal em ~25%.',
      },
      {
        q: 'Posso usar FGTS pra dar entrada?',
        a: 'Sim, e é altamente recomendado. FGTS rende ~3% a.a. (TR + 3%) parado no fundo, abaixo da inflação. Sacar para entrada de imóvel via SFH é uma das raras situações onde o FGTS realmente vale o que você acumulou. Pode usar FGTS para entrada, amortização ou até para quitar o saldo devedor.',
      },
      {
        q: 'É melhor alugar ou comprar?',
        a: 'Depende muito do mercado local, prazo, e custo de oportunidade do dinheiro. Regra simples: se aluguel mensal é menor que 0,4% do valor do imóvel (ex: aluguel de R$ 1.600 num imóvel de R$ 500 mil = 0,32%), alugar e investir a diferença geralmente rende mais. Se aluguel é maior que 0,5%, comprar é mais vantajoso financeiramente. Considere também estabilidade de vida e custos de mudança.',
      },
    ],
    related: ['juntar-100-mil', 'juntar-1-milhao', 'aposentadoria-2-milhoes'],
  },

  'aposentadoria-2-milhoes': {
    h1: 'Quanto Investir por Mês Pra Aposentar Com R$ 2 Milhões?',
    title: 'Quanto Investir Pra Aposentar Com R$ 2 Milhões?',
    metaDescription: 'Para acumular R$ 2 milhões em 25 anos a 10% a.a. invista R$ 1.514/mês. Gera R$ 6.667/mês de renda passiva. Calcule grátis.',
    answerFirst:
      'Para acumular R$ 2 milhões em 25 anos a 10% ao ano, você precisa investir R$ 1.514 por mês. Em 30 anos cai para R$ 884/mês. Em 20 anos sobe para R$ 2.642/mês. Pela regra dos 4%, R$ 2 milhões geram R$ 6.667/mês de renda passiva sustentável, padrão classe média confortável no Brasil. Combinado com INSS (R$ 2-7 mil/mês para quem contribui pelo teto), vira aposentadoria com R$ 9-14 mil/mês total, vida tranquila sem grandes restrições.',
    preview: 'R$ 2 milhões em 25 anos: R$ 1.514/mês a 10%.',
    badges: baseBadges,
    inputs: { goal: 2000000, years: 25, wealth: 0, rate: 10 },
    eduH2: 'R$ 2 milhões: a meta da aposentadoria confortável',
    eduBlocks: [
      {
        h3: 'Por que R$ 2 milhões é o sweet spot da aposentadoria',
        paragraphs: [
          'R$ 2 milhões é o sweet spot entre meta atingível e renda passiva relevante. Pela regra dos 4%, gera R$ 6.667/mês de renda sustentável, equivalente a 2-2,5x o salário médio brasileiro. Combinado com INSS, totaliza R$ 9-14 mil/mês na aposentadoria, padrão classe média alta com folga para saúde, viagens e qualidade de vida.',
          'Diferente de R$ 1 milhão (Lean FIRE, vida frugal) e R$ 5 milhões (Fat FIRE, alto padrão), R$ 2 milhões é a meta clássica do Regular FIRE brasileiro. Atingível em 20-30 anos com aporte mensal entre R$ 884 e R$ 2.642, faixa que cabe no orçamento de qualquer profissional de classe média que se compromete cedo.',
        ],
      },
      {
        h3: 'Acelerar a meta com aporte crescente',
        paragraphs: [
          'A calculadora padrão assume aporte fixo, mas a vida real envolve aumento de renda. Aumentar o aporte 5% ao ano (acompanhando inflação + crescimento salarial) reduz o aporte inicial necessário em 25-35%. Em vez de R$ 1.514/mês fixo por 25 anos, você começa com R$ 1.000/mês e termina em R$ 2.300/mês, atingindo a mesma meta com menos esforço inicial.',
          'Aportes extras esporádicos (13º salário inteiro, PLR, restituição IR, herança) também aceleram a meta. Direcionar o 13º durante 25 anos reduz o aporte mensal exigido em ~10-15%. Pequenas decisões de gestão fazem diferença gigante no longo prazo, principalmente quando o dinheiro extra entra cedo no plano.',
        ],
      },
    ],
    faq: [
      {
        q: 'Quanto investir por mês pra ter R$ 2 milhões em 20 anos?',
        a: 'A 10% a.a., R$ 2.642/mês. A 12% a.a., R$ 2.022/mês. Total de aportes: R$ 485-635 mil. Total de juros: R$ 1,365-1,515 milhão. Aporte exigente, viável para profissional de alta renda ou casal investindo em conjunto.',
      },
      {
        q: 'Quanto investir por mês pra ter R$ 2 milhões em 25 anos?',
        a: 'A 10% a.a., R$ 1.514/mês. A 12% a.a., R$ 1.075/mês. Total de aportes: R$ 322-454 mil. Total de juros: R$ 1,546-1,678 milhão. Cenário mais buscado, equilibra esforço e prazo razoável.',
      },
      {
        q: 'Quanto investir por mês pra ter R$ 2 milhões em 30 anos?',
        a: 'A 10% a.a., R$ 884/mês. A 12% a.a., R$ 572/mês. Total de aportes: R$ 206-318 mil. Total de juros: R$ 1,682-1,794 milhão. Cenário ideal para quem começa cedo, juros compostos respondem por 84-90% do patrimônio.',
      },
      {
        q: 'R$ 2 milhões dão pra viver bem na aposentadoria?',
        a: 'Sim, com folga. Pela regra dos 4%, geram R$ 6.667/mês de renda passiva. Combinado com INSS de R$ 2-5 mil, totaliza R$ 9-12 mil/mês. Cobre padrão classe média alta em qualquer cidade do Brasil, com plano de saúde privado, viagens nacionais anuais e até alguma viagem internacional.',
      },
      {
        q: 'Já tenho R$ 200 mil acumulados, isso ajuda muito?',
        a: 'Bastante. R$ 200 mil aplicados a 10% a.a. crescem sozinhos para R$ 2,17 milhões em 25 anos. Ou seja, sem aporte adicional algum você já passa da meta de R$ 2 milhões. Com aporte modesto de R$ 200/mês, o patrimônio chega a R$ 2,4 milhões, antecipando ou superando a meta.',
      },
    ],
    related: ['juntar-1-milhao', 'juntar-100-mil', 'entrada-imovel'],
  },
}

const route = useRoute()
const router = useRouter()
const slug = computed(() => String(route.params.scenario || ''))
const scenario = computed<ScenarioConfig>(() => {
  const found = scenarios[slug.value]
  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Cenário não encontrado' })
  }
  return found
})

const relatedScenarios = computed(() =>
  scenario.value.related
    .map((slugRel) => {
      const item = scenarios[slugRel]
      if (!item) return null
      return { slug: slugRel, h1: item.h1, preview: item.preview }
    })
    .filter((x): x is { slug: string; h1: string; preview: string } => !!x),
)

const brand = useBrand()
const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated',
)

// Pre-fill calculator: redirect once with query params so MonthlyInvestment.vue
// reads them on mount via parseNumberParam. Path stays the same so canonical
// points to the path-based URL (each long-tail is its own canonical).
onMounted(() => {
  if (process.client && !route.query.goal && !route.query._seeded) {
    const inputs = scenario.value.inputs
    router.replace({
      path: route.path,
      query: {
        goal: String(inputs.goal),
        years: String(inputs.years),
        wealth: String(inputs.wealth),
        rate: String(inputs.rate),
        _seeded: '1',
      },
    })
  }
})

const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const lastUpdatedISO = lastUpdated.toISOString()

const pageTitle = computed(() => `${scenario.value.title} | ${brand.name}`)
const pageDescription = computed(() => scenario.value.metaDescription)

usePageSeo({
  title: pageTitle,
  description: pageDescription,
  path: route.path,
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Quanto Investir', path: '/calculadora/quanto-investir' },
    { name: scenario.value.h1, path: route.path },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `${scenario.value.title} - ${brand.name}`,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Planejamento financeiro',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      dateModified: lastUpdatedISO,
      description: scenario.value.metaDescription,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: scenario.value.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ],
})

useHead({
  link: [
    { rel: 'prev', href: '/calculadora/quanto-investir' },
  ],
})

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})
</script>

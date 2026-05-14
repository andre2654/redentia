<template>
  <NuxtLayout name="default" title="Calculadora de Preço Teto">
    <CalculatorFairPrice
      :assets="assets"
      :assets-loading="assetsLoading"
      :sectors="sectors"
      back-to="/calculadora"
      back-label="Todas as calculadoras"
      :last-updated="lastUpdatedText"
    >
      <template #hero>
        <p class="calc-eyebrow">Calculadora · Preço Teto e Preço Justo</p>
        <h1 class="calc-title">
          Graham, Bazin, P/L e
          <em class="calc-italic">VPA.</em>
        </h1>
        <p class="calc-lead">
          O preço teto é o valor máximo que vale pagar por uma ação considerando seus fundamentos. Calcula-se por <strong>Graham</strong> (√(22.5×LPA×VPA)), <strong>Bazin</strong> (Dividendo÷0,06), <strong>P/L</strong> setorial ou <strong>VPA</strong>×1,5. Exemplo: ITUB4 com LPA R$ 3,50 e VPA R$ 18,00 tem preço teto Graham de R$ 35,55, ou seja, vale a compra abaixo desse valor.
        </p>
        <ul class="calc-chips">
          <li><span class="dot positive" /> 100% gratuito</li>
          <li><span class="dot" /> Cálculo instantâneo</li>
          <li><span class="dot" /> Dados oficiais da B3</li>
          <li><span class="dot" /> Graham · Bazin · P/L · VPA</li>
        </ul>
      </template>
    </CalculatorFairPrice>

    <section class="calc-aux flex flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8">

      <!-- Ações Populares (internal linking + deep links para SEO) -->
      <div
        class="flex flex-col gap-3 rounded-lg border p-4 sm:p-6"
        :style="{
          backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
          borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
        }"
      >
        <h2>Ações populares para calcular preço teto</h2>
        <p class="text-sm">
          Acesse o cálculo pronto das ações mais buscadas da Bolsa brasileira.
        </p>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <NuxtLink
            v-for="t in popularTickers"
            :key="t.ticker"
            :to="`/calculadora/preco-teto?ticker=${t.ticker}`"
            class="group flex min-h-[44px] items-center gap-2 rounded-md border px-3 py-2 transition hover:border-secondary/40 hover:bg-secondary/10"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <UIcon name="i-lucide-target" class="size-4 shrink-0 text-secondary" />
            <div class="flex min-w-0 flex-col">
              <span class="text-sm font-medium">{{ t.ticker }}</span>
              <span class="line-clamp-1 text-[10px]" :style="{ color: 'var(--brand-text-muted)' }">{{ t.name }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Conteúdo Educacional -->
      <div class="quiet-prose calc-edu-prose max-w-none">
        <h2>Simulador de preço teto grátis e online</h2>
        <p class="leading-relaxed">
          Use a calculadora acima para simular o preço teto de qualquer ação da B3 em segundos. Ideal pra quem busca uma referência rápida antes de comprar.
        </p>

        <h2>O que é Preço Teto?</h2>
        <p class="leading-relaxed">
          O preço teto é o valor máximo que você deveria pagar por uma ação, considerando seus fundamentos e uma margem de segurança. É um conceito fundamental da análise fundamentalista, popularizado por Benjamin Graham (o "pai do value investing") e adaptado por investidores brasileiros como Décio Bazin.
        </p>
        <p class="leading-relaxed">
          Diferente de apenas olhar o preço atual da ação, o preço teto considera indicadores como lucro, patrimônio, dividendos e múltiplos do setor para determinar um valor justo. Se a ação estiver abaixo do preço teto, pode ser uma boa oportunidade de compra. Se estiver acima, pode estar cara.
        </p>

        <h2>Metodologias de Cálculo</h2>

        <h3>1. Fórmula de Benjamin Graham</h3>
        <div class="brand-card border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg">
            Preço Teto = √(22.5 × LPA × VPA)
          </p>
          <div class="mt-4 space-y-2 text-sm">
            <p><strong>LPA</strong> = Lucro por Ação (últimos 12 meses)</p>
            <p><strong>VPA</strong> = Valor Patrimonial por Ação</p>
            <p><strong>22.5</strong> = Constante de Graham (P/L 15 × P/VP 1.5)</p>
          </div>
        </div>
        <p class="leading-relaxed">
          Graham defendia que empresas deveriam ser compradas com P/L máximo de 15 e P/VP máximo de 1.5. A fórmula combina esses dois critérios em um único número. É ideal para empresas maduras e lucrativas.
        </p>

        <h3>2. Método Bazin (Dividendos)</h3>
        <div class="brand-card border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg">
            Preço Teto = Dividendo Anual ÷ 0.06
          </p>
          <div class="mt-4 space-y-2 text-sm">
            <p><strong>Dividendo Anual</strong> = Soma dos dividendos por ação nos últimos 12 meses</p>
            <p><strong>0.06 (6%)</strong> = Dividend Yield mínimo aceitável segundo Bazin</p>
          </div>
        </div>
        <p class="leading-relaxed">
          Décio Bazin focava em dividendos consistentes. Segundo ele, uma ação só vale a pena se pagar pelo menos 6% de dividend yield. O método é excelente para quem busca renda passiva e empresas consolidadas que distribuem lucros regularmente.
        </p>

        <h3>3. P/L Setorial</h3>
        <div class="brand-card border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg">
            Preço Teto = LPA × P/L Médio do Setor
          </p>
          <div class="mt-4 space-y-2 text-sm">
            <p><strong>P/L Médio</strong> = Média do Price/Earnings ratio das empresas do mesmo setor</p>
          </div>
        </div>
        <p class="leading-relaxed">
          Cada setor tem um P/L considerado "normal". Bancos costumam ter P/L de 8-12, enquanto tecnologia pode ter 20-30. Comparar com o setor evita julgar uma empresa por padrões inadequados.
        </p>

        <h3>4. Valor Patrimonial (Graham Modificado)</h3>
        <div class="brand-card border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg">
            Preço Teto = VPA × 1.5
          </p>
          <div class="mt-4 space-y-2 text-sm">
            <p><strong>VPA</strong> = Patrimônio Líquido ÷ Número de Ações</p>
            <p><strong>1.5</strong> = Margem máxima sobre valor contábil (Graham)</p>
          </div>
        </div>
        <p class="leading-relaxed">
          Graham sugeria não pagar mais que 1.5x o valor patrimonial. Útil para empresas com muitos ativos tangíveis (bancos, seguradoras, indústrias). Menos efetivo para empresas de serviço ou tecnologia.
        </p>

        <h2>Indicadores de análise fundamentalista</h2>
        <p class="leading-relaxed">
          O preço teto é apenas uma parte da análise fundamentalista. Antes de comprar, cruze o resultado com os principais indicadores de qualidade da empresa. Eles dizem se o desconto é real ou se a ação está barata por um motivo legítimo.
        </p>
        <div
          class="brand-card border p-5"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
            borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
          }"
        >
          <ul class="space-y-2 text-sm">
            <li><strong>P/L (Preço/Lucro):</strong> quantos anos de lucro o preço atual representa. Bancos 8-12, varejo 12-18, tecnologia 20-30.</li>
            <li><strong>P/VP (Preço/Valor Patrimonial):</strong> quantas vezes o patrimônio líquido o preço representa. Abaixo de 1,5 é o limite Graham; abaixo de 1,0 indica desconto sobre o valor contábil.</li>
            <li><strong>ROE (Retorno sobre Patrimônio):</strong> quanto a empresa gera de lucro para cada R$ 1 de patrimônio. Bom: acima de 15% ao ano; excelente: acima de 20%.</li>
            <li><strong>ROIC (Retorno sobre Capital Investido):</strong> mede eficiência operacional descontando dívida. ROIC acima do custo de capital (~12% no Brasil) significa que a empresa cria valor.</li>
            <li><strong>Dívida Líquida/EBITDA:</strong> quantos anos de geração de caixa para quitar a dívida. Saudável: abaixo de 3x; alerta: acima de 4x.</li>
            <li><strong>Margem Líquida:</strong> percentual do faturamento que vira lucro. Varia por setor: bancos 25-35%, varejo 2-6%, software 15-30%.</li>
            <li><strong>Payout:</strong> percentual do lucro distribuído em dividendos. Sustentável: 40-60% para empresas tradicionais; FIIs distribuem 95%+ por lei.</li>
            <li><strong>Dividend Yield (DY):</strong> dividendos anuais sobre o preço atual. Bazin exige no mínimo 6% para considerar a ação atrativa.</li>
          </ul>
        </div>

        <h2>Exemplos Práticos</h2>

        <h3>Exemplo 1: Itaú Unibanco (ITUB4)</h3>
        <div
          class="brand-card border p-5"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
            borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
          }"
        >
          <h4 class="mb-3">Dados (valores ilustrativos):</h4>
          <ul class="mb-4 space-y-1 text-sm">
            <li>Preço atual: R$ 28,00</li>
            <li>LPA: R$ 3,50</li>
            <li>VPA: R$ 18,00</li>
            <li>Dividendo anual: R$ 1,80</li>
            <li>P/L médio setor bancário: 10</li>
          </ul>
          <div class="grid gap-3 md:grid-cols-2">
            <div
              class="rounded-lg p-3"
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 75%, var(--brand-background))' }"
            >
              <p class="text-xs">Graham</p>
              <p>√(22.5 × 3.50 × 18) = R$ 35,55</p>
            </div>
            <div
              class="rounded-lg p-3"
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 75%, var(--brand-background))' }"
            >
              <p class="text-xs">Bazin</p>
              <p>1.80 ÷ 0.06 = R$ 30,00</p>
            </div>
            <div
              class="rounded-lg p-3"
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 75%, var(--brand-background))' }"
            >
              <p class="text-xs">P/L Setorial</p>
              <p>3.50 × 10 = R$ 35,00</p>
            </div>
            <div
              class="rounded-lg p-3"
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 75%, var(--brand-background))' }"
            >
              <p class="text-xs">Valor Patrimonial</p>
              <p>18 × 1.5 = R$ 27,00</p>
            </div>
          </div>
          <div class="mt-4 rounded-lg bg-secondary/20 p-3">
            <p class="text-sm text-secondary">
              Preço Teto Médio: R$ 31,89
            </p>
            <p class="text-xs mt-1">
              Preço atual (R$ 28,00) está 12% abaixo do teto médio. Boa margem de segurança!
            </p>
          </div>
        </div>

        <h3>Exemplo 2: Petrobras (PETR4)</h3>
        <div
          class="brand-card border p-5"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
            borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
          }"
        >
          <h4 class="mb-3">Dados (valores ilustrativos):</h4>
          <ul class="mb-4 space-y-1 text-sm">
            <li>Preço atual: R$ 38,00</li>
            <li>LPA: R$ 8,00</li>
            <li>VPA: R$ 35,00</li>
            <li>Dividendo anual: R$ 5,00</li>
            <li>P/L médio setor petróleo: 6</li>
          </ul>
          <div class="grid gap-3 md:grid-cols-2">
            <div
              class="rounded-lg p-3"
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 75%, var(--brand-background))' }"
            >
              <p class="text-xs">Graham</p>
              <p>√(22.5 × 8 × 35) = R$ 79,37</p>
            </div>
            <div
              class="rounded-lg p-3"
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 75%, var(--brand-background))' }"
            >
              <p class="text-xs">Bazin</p>
              <p>5 ÷ 0.06 = R$ 83,33</p>
            </div>
            <div
              class="rounded-lg p-3"
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 75%, var(--brand-background))' }"
            >
              <p class="text-xs">P/L Setorial</p>
              <p>8 × 6 = R$ 48,00</p>
            </div>
            <div
              class="rounded-lg p-3"
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 75%, var(--brand-background))' }"
            >
              <p class="text-xs">Valor Patrimonial</p>
              <p>35 × 1.5 = R$ 52,50</p>
            </div>
          </div>
          <div
            class="mt-4 rounded-lg p-3"
            :style="{ backgroundColor: `color-mix(in srgb, var(--brand-positive) 20%, transparent)` }"
          >
            <p class="text-sm" :style="{ color: 'var(--brand-positive)' }">
              Preço Teto Médio: R$ 65,80
            </p>
            <p class="text-xs mt-1">
              Preço atual (R$ 38,00) está 42% abaixo do teto médio. Excelente oportunidade segundo as métricas!
            </p>
          </div>
        </div>

        <h2>Como Usar a Calculadora</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              1
            </div>
            <div>
              <h4>Reúna os Dados da Ação</h4>
              <p class="text-sm">
                Use a própria página do ativo aqui na Redentia ou o site de RI da empresa. Você precisa de: LPA, VPA, dividendos dos últimos 12 meses e P/L médio do setor.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              2
            </div>
            <div>
              <h4>Preencha os Campos</h4>
              <p class="text-sm">
                Insira ticker, preço atual e os indicadores. Use valores dos últimos 12 meses (TTM - Trailing Twelve Months) para maior precisão.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              3
            </div>
            <div>
              <h4>Analise as 4 Metodologias</h4>
              <p class="text-sm">
                Cada método tem seus pontos fortes. Graham é conservador, Bazin foca dividendos, P/L setorial contextualiza, e VPA é bom para empresas com ativos.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              4
            </div>
            <div>
              <h4>Veja o Consenso</h4>
              <p class="text-sm">
                A média das metodologias fornece uma visão balanceada. Se a maioria indicar "Barato", a ação pode estar em bom momento de compra.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              5
            </div>
            <div>
              <h4>Analise Outros Fundamentos</h4>
              <p class="text-sm">
                Preço teto é um filtro, não a decisão final. Avalie também: endividamento, ROE, crescimento de receita, perspectivas do setor e qualidade da gestão.
              </p>
            </div>
          </div>
        </div>

        <h2>Value Investing vs Growth Investing</h2>
        <p class="leading-relaxed">
          A calculadora de preço teto é uma ferramenta clássica do value investing, escola que busca empresas negociadas abaixo do valor intrínseco. Antes de aplicar as fórmulas, vale entender se o ativo analisado faz sentido pra essa filosofia ou se ele pertence ao outro lado, growth investing.
        </p>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Value Investing</h4>
            <p class="text-sm">
              Foco em preço teto, fórmulas Graham e Bazin, dividendos consistentes, ROE alto, P/L baixo e margem de segurança. O investidor procura empresas maduras pagando bom dividendo, com lucro previsível e múltiplos esticados pra baixo. Resultado costuma vir devagar, com renda recorrente.
            </p>
            <p class="mt-2 text-xs" :style="{ color: 'var(--brand-text-muted)' }">
              Exemplos clássicos na B3: ITUB4, BBAS3, TAEE11.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Growth Investing</h4>
            <p class="text-sm">
              Foco em receita crescente, reinvestimento de lucros e expansão de margem futura. P/L alto é tolerado quando justificado por crescimento de dois dígitos por vários anos. As fórmulas tradicionais subestimam essas empresas porque o lucro presente é pequeno comparado ao potencial. Para essas, prefira múltiplos de receita (P/S, EV/Sales) ou fluxo de caixa descontado (DCF).
            </p>
            <p class="mt-2 text-xs" :style="{ color: 'var(--brand-text-muted)' }">
              Exemplos: WEGE3, MGLU3 (em fase forte), Stone, Magalu nos anos bons.
            </p>
          </div>
        </div>

        <h2>Limitações e Quando NÃO Usar</h2>
        <div class="space-y-3">
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: `color-mix(in srgb, var(--brand-negative) 25%, transparent)`,
              backgroundColor: `color-mix(in srgb, var(--brand-negative) 8%, transparent)`,
            }"
          >
            <h4 class="mb-1" :style="{ color: 'var(--brand-negative)' }">Empresas de Crescimento (Growth)</h4>
            <p class="text-sm">
              Empresas como Magazine Luiza, Mercado Livre, que crescem rápido mas têm lucro baixo ou prejuízo, não funcionam bem com essas fórmulas. Prefira análise de múltiplos de receita ou fluxo de caixa descontado.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: `color-mix(in srgb, var(--brand-negative) 25%, transparent)`,
              backgroundColor: `color-mix(in srgb, var(--brand-negative) 8%, transparent)`,
            }"
          >
            <h4 class="mb-1" :style="{ color: 'var(--brand-negative)' }">Empresas com Prejuízo</h4>
            <p class="text-sm">
              Se o LPA é negativo, as fórmulas não funcionam. A empresa pode estar em reestruturação ou em setor cíclico no momento ruim.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: `color-mix(in srgb, var(--brand-negative) 25%, transparent)`,
              backgroundColor: `color-mix(in srgb, var(--brand-negative) 8%, transparent)`,
            }"
          >
            <h4 class="mb-1" :style="{ color: 'var(--brand-negative)' }">Setores Muito Cíclicos</h4>
            <p class="text-sm">
              Commodities (mineração, siderurgia) têm lucros que variam muito. Use LPA médio de vários anos ou análise de ciclos.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: `color-mix(in srgb, var(--brand-negative) 25%, transparent)`,
              backgroundColor: `color-mix(in srgb, var(--brand-negative) 8%, transparent)`,
            }"
          >
            <h4 class="mb-1" :style="{ color: 'var(--brand-negative)' }">Empresas com Dívida Altíssima</h4>
            <p class="text-sm">
              Se a empresa está super endividada, o valor patrimonial pode estar inflado. Verifique Dívida Líquida / EBITDA antes.
            </p>
          </div>
        </div>

        <MoleculesFAQ
          title="Perguntas Frequentes"
          :items="faqItems"
        />

        <h2>Dicas para Investir com Preço Teto</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              1. Use Como Filtro Inicial
            </h4>
            <p class="text-sm">
              Calcule o preço teto de 10-20 ações que você gosta. Descarte as que estão muito acima do teto. Foque análise profunda nas que estão abaixo.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              2. Combine com Outros Indicadores
            </h4>
            <p class="text-sm">
              Não use apenas preço teto. Veja também: ROE > 15%, Dívida/EBITDA < 3, Crescimento de receita > 5% a.a., Payout sustentável.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              3. Exija Margem de Segurança
            </h4>
            <p class="text-sm">
              Nunca compre no preço teto ou acima. Espere pelo menos 20% de margem. Em momentos de crise, você pode conseguir 40-50% de desconto.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              4. Reavalie Periodicamente
            </h4>
            <p class="text-sm">
              Fundamentos mudam. Uma ação que estava barata pode ficar cara se o lucro cair. Recalcule após cada balanço trimestral.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              5. Entenda o "Por Quê"
            </h4>
            <p class="text-sm">
              Se uma ação está 50% abaixo do preço teto, investigue o porquê. Pode ser oportunidade ou problema real que o mercado já precificou.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              6. Seja Paciente
            </h4>
            <p class="text-sm">
              Value investing exige paciência. Pode levar meses ou anos para o mercado reconhecer o valor. Não espere ganhos rápidos.
            </p>
          </div>
        </div>
      </div>

      <!-- Rankings Relacionados — pontes pra listas atualizadas que
           complementam o calculo de preco teto (Graham, Bazin, upside). -->
      <div
        class="mt-8 flex flex-col gap-4 rounded-lg p-6"
        :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
      >
        <div>
          <h2>Rankings Relacionados</h2>
          <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">
            Explore listas atualizadas diariamente com os melhores ativos da B3 para complementar sua análise.
          </p>
        </div>
        <div class="grid gap-4 md:grid-cols-3">
          <NuxtLink
            v-for="r in relatedRankings"
            :key="r.to"
            :to="r.to"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <UIcon :name="r.icon" class="text-secondary size-8 shrink-0" />
            <div>
              <h3>{{ r.title }}</h3>
              <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">{{ r.sub }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Calculadoras Relacionadas -->
      <div
        class="flex flex-col gap-4 rounded-lg p-6"
        :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
      >
        <h2>Outras Ferramentas</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/dividend-yield"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <UIcon
              name="i-lucide-coins"
              class="text-secondary size-8 shrink-0"
            />
            <div>
              <h3>Calculadora de Dividend Yield</h3>
              <p class="text-sm">
                Calcule DY atual e projetado
              </p>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/calculadora/acoes"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <UIcon
              name="i-lucide-chart-line"
              class="text-secondary size-8 shrink-0"
            />
            <div>
              <h3>Simulador de Ações</h3>
              <p class="text-sm">
                Histórico real de investimentos
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- CTA -->
      <MoleculesCtaSection
        :title="`Analise Ações na ${brand.name}`"
        description="Acesse dados fundamentalistas em tempo real, compare indicadores e receba análises com IA."
        :buttons="[
          { label: 'Criar conta grátis', to: '/auth/register', icon: 'i-lucide-arrow-right', variant: 'primary' },
          { label: 'Ver ações', to: '/acoes', variant: 'outline' },
        ]"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAssetsService } from '~/services/assets'

const brand = useBrand()
const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)
const { getAssets, getSectors } = useAssetsService()

const [{ data: assetsData, pending: assetsPending }, { data: sectorsData }] = await Promise.all([
  useAsyncData('assets-calculator-preco-teto', () => getAssets()),
  useAsyncData('sectors-calculator-preco-teto', () => getSectors().catch(() => [])),
])

const assets = computed(() => assetsData.value ?? [])
const assetsLoading = computed(() => assetsPending.value)
const sectors = computed(() => sectorsData.value ?? [])

// Freshness signal — bump CONTENT_VERSION quando reformular o conteudo
// (novas FAQs, mudanca em metodologia, ano novo). Google usa
// dateModified como sinal de relevancia, manter mensal evita pagina
// "envelhecer" no indice.
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const lastUpdatedISO = lastUpdated.toISOString().slice(0, 10)

// Rankings relacionados — listas atualizadas que ampliam a analise do
// preco teto (Graham, Bazin, upside potencial). Usadas no card de
// "Rankings Relacionados" antes do bloco de Outras Ferramentas.
const relatedRankings = [
  {
    to: '/ranking/mais-baratas-graham',
    icon: 'i-lucide-percent',
    title: 'Ações mais baratas pelo Graham',
    sub: 'Maior desconto em relação ao preço justo de Graham',
  },
  {
    to: '/ranking/mais-baratas-bazin',
    icon: 'i-lucide-tag',
    title: 'Ações mais baratas pelo Bazin',
    sub: 'Top desconto pelo método de Décio Bazin',
  },
  {
    to: '/ranking/maior-potencial-upside',
    icon: 'i-lucide-rocket',
    title: 'Maior potencial de upside',
    sub: 'Consenso de analistas vs preço atual',
  },
] as const

const popularTickers = [
  { ticker: 'PETR4', name: 'Petrobras' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco' },
  { ticker: 'VALE3', name: 'Vale' },
  { ticker: 'BBAS3', name: 'Banco do Brasil' },
  { ticker: 'BBDC4', name: 'Bradesco' },
  { ticker: 'BBSE3', name: 'BB Seguridade' },
  { ticker: 'WEGE3', name: 'WEG' },
  { ticker: 'ITSA4', name: 'Itaúsa' },
  { ticker: 'B3SA3', name: 'B3' },
  { ticker: 'MGLU3', name: 'Magazine Luiza' },
  { ticker: 'ABEV3', name: 'Ambev' },
  { ticker: 'SUZB3', name: 'Suzano' },
  { ticker: 'RENT3', name: 'Localiza' },
]

const pageTitle = `Calculadora de Preço Teto 2026 - Grátis | ${brand.name}`
const pageDescription =
  'Calcule o preço teto e preço justo de qualquer ação da B3 por Graham, Bazin, P/L e VPA em 1 clique. Veja margem de segurança e veredito. Grátis.'

const faqItems = [
  {
    question: 'O que é preço teto e por que calcular?',
    answer: 'Preço teto é o valor máximo que um investidor deveria pagar por uma ação considerando seus fundamentos e uma margem de segurança. É a referência central da análise fundamentalista: se a ação estiver negociando abaixo do preço teto, pode estar barata; se estiver acima, pode estar cara.',
  },
  {
    question: 'Qual a diferença entre preço teto e preço justo?',
    answer: 'São praticamente sinônimos. "Preço teto" enfatiza o limite máximo aceitável de compra (com margem de segurança); "preço justo" enfatiza o valor intrínseco da empresa pelos fundamentos. As 4 metodologias (Graham, Bazin, P/L Setorial, VPA) calculam o preço justo, e por convenção esse valor é tratado como o preço teto, ou seja, o limite acima do qual a ação fica cara.',
  },
  {
    question: 'Qual a melhor metodologia: Graham ou Bazin?',
    answer: 'Depende do perfil. Bazin é ideal para quem busca renda passiva com dividendos e exige DY mínimo de 6% ao ano. Graham é mais conservador e equilibra lucro e patrimônio líquido, sendo ideal para empresas maduras e rentáveis. Na prática, use as duas e compare com P/L setorial e VPA para ter uma visão completa.',
  },
  {
    question: 'Se a ação está abaixo do preço teto, é garantia de boa compra?',
    answer: 'Não. O preço teto é um filtro inicial, não uma garantia. A ação pode estar barata porque o mercado antecipa problemas: queda de lucro, concorrência, setor em declínio ou mudança regulatória. Sempre investigue o porquê antes de comprar, para evitar caírem uma "value trap" (armadilha de valor).',
  },
  {
    question: 'Como calcular a margem de segurança?',
    answer: 'Margem de Segurança = (Preço Teto − Preço Atual) ÷ Preço Teto × 100. Se o teto é R$ 40 e a ação está R$ 30, a margem é de 25%. Benjamin Graham sugeria no mínimo 20% a 30% de margem para investir com segurança. Quanto maior a margem, menor o risco de erro de análise.',
  },
  {
    question: 'A calculadora serve para FIIs (Fundos Imobiliários)?',
    answer: 'Parcialmente. Para FIIs use principalmente o Método Bazin (Dividendo ÷ Yield mínimo) e a análise de P/VP. Um bom FII costuma ter P/VP abaixo de 1,0, DY acima de 8% e vacância baixa. A fórmula de Graham não se aplica bem porque FIIs não têm "lucro" tradicional.',
  },
  {
    question: 'E para empresas de crescimento como Magazine Luiza?',
    answer: 'As fórmulas tradicionais de preço teto não capturam bem growth stocks. Empresas que reinvestem todo o lucro têm LPA baixo ou negativo, mas podem ter um futuro excelente. Para essas, prefira múltiplos de receita (P/S ou EV/Sales), fluxo de caixa descontado (DCF) ou comparação com pares de mercado.',
  },
  {
    question: 'Com que frequência devo recalcular o preço teto?',
    answer: 'Recalcule trimestralmente, após cada balanço da empresa. LPA, VPA e dividendos mudam a cada trimestre. Se você acompanha a empresa de perto, revise a cada 3 meses. Para investidores de longo prazo, uma vez por ano pode bastar, desde que não haja eventos materiais no meio do caminho.',
  },
  {
    question: 'De onde vêm os dados da calculadora?',
    answer: `A ${brand.name} utiliza dados públicos da B3 (Bolsa brasileira), Comissão de Valores Mobiliários (CVM) e demonstrações financeiras oficiais das empresas, atualizados automaticamente após cada pregão e divulgação de balanço.`,
  },
  {
    question: 'Vale usar preço teto para small caps?',
    answer: 'Sim, com cautela. Small caps tendem a ter P/L mais alto porque o mercado paga pelo crescimento futuro. Use P/L setorial ajustado para small caps (15-20), exija margem de segurança maior (30-40%) e diversifique, já que esses papéis têm volatilidade e risco de liquidez maiores.',
  },
  {
    question: 'O que fazer se as 4 metodologias derem resultados muito diferentes?',
    answer: 'É normal. Cada método olha a empresa por um ângulo. Se Graham, Bazin, P/L e VPA divergem bastante, dê mais peso ao método que faz mais sentido para aquela empresa: bancos tendem a responder bem a VPA e P/L, pagadoras de dividendos ao Bazin, industriais a Graham. Use a média ponderada como consenso.',
  },
]

usePageSeo({
  title: pageTitle,
  description: pageDescription,
  path: '/calculadora/preco-teto',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Preço Teto', path: '/calculadora/preco-teto' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `Calculadora de Preço Teto ${brand.name}`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      description:
        'Calculadora gratuita de preço teto para ações da B3. Calcula Graham, Bazin, P/L setorial e valor patrimonial automaticamente a partir do ticker.',
      featureList: [
        'Cálculo automático a partir do ticker',
        'Fórmula de Benjamin Graham',
        'Método Décio Bazin',
        'P/L Setorial',
        'Valor Patrimonial (VPA x 1.5)',
        'Margem de segurança por metodologia',
        'Consenso e recomendação de compra',
        'Comparação visual entre métodos',
      ],
      about: [
        { '@type': 'Organization', name: 'B3', url: 'https://www.b3.com.br' },
        { '@type': 'Organization', name: 'CVM', url: 'https://www.gov.br/cvm' },
        { '@type': 'Person', name: 'Benjamin Graham' },
      ],
    },
    // FAQPage schema é emitido pelo <MoleculesFAQ> via useHead — fonte unica.
  ],
})

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})
</script>

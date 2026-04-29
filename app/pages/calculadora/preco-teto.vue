<template>
  <NuxtLayout :name="layoutName" title="Calculadora de Preço Teto">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Back-link to parent listing -->
      <NuxtLink
        to="/calculadora"
        class="flex items-center gap-1 text-xs transition hover:opacity-80"
        :style="{ color: brand.colors.textMuted }"
      >
        <UIcon name="i-lucide-chevron-left" class="size-3" />
        Todas as calculadoras
      </NuxtLink>

      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-target" class="text-secondary h-8 w-8" />
          <h1
            class="font-light"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(28px, 4vw, 36px)',
              lineHeight: 1.05,
              letterSpacing: '-0.7px',
            }"
          >Calculadora de Preço Teto: Graham, Bazin, P/L Setorial e VPA</h1>
        </div>
        <p class="text-base md:text-lg">
          Escolha uma ação da B3 e receba na hora o preço justo calculado pelas 4 principais metodologias da análise fundamentalista, com dados atualizados, consenso de margem de segurança e veredito de compra. Sem planilhas, sem cadastro.
        </p>
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-check-circle" class="size-4 text-green-400" />
            100% gratuito
          </span>
          <span>·</span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-zap" class="size-4 text-secondary" />
            Cálculo instantâneo
          </span>
          <span>·</span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-database" class="size-4 text-blue-400" />
            Dados oficiais da B3
          </span>
          <span>·</span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-layers" class="size-4 text-purple-400" />
            Graham · Bazin · P/L · VPA
          </span>
        </div>
      </div>

      <!-- Calculadora -->
      <CalculatorFairPrice
        :assets="assets"
        :assets-loading="assetsLoading"
        :sectors="sectors"
      />

      <!-- Ações Populares (internal linking + deep links para SEO) -->
      <div
        class="flex flex-col gap-3 rounded-[30px] border p-6"
        :style="{
          backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
          borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
        }"
      >
        <h2>Ações populares para calcular preço teto</h2>
        <p class="text-sm">
          Acesse o cálculo pronto das ações mais buscadas da Bolsa brasileira.
        </p>
        <div class="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
          <NuxtLink
            v-for="t in popularTickers"
            :key="t.ticker"
            :to="`/calculadora/preco-teto?ticker=${t.ticker}`"
            class="group flex items-center gap-2 rounded-xl border px-3 py-2 transition hover:border-secondary/40 hover:bg-secondary/10"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <UIcon name="i-lucide-target" class="size-4 text-secondary" />
            <div class="flex flex-col">
              <span class="text-sm">{{ t.ticker }}</span>
              <span class="text-[10px] line-clamp-1">{{ t.name }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Conteúdo Educacional -->
      <div class="max-w-none">
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

        <h2>Exemplos Práticos</h2>

        <h3>Exemplo 1: Itaú Unibanco (ITUB4)</h3>
        <div
          class="brand-card border p-5"
          :style="{
            backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
            borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
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
              :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 75%, ' + brand.colors.background + ')' }"
            >
              <p class="text-xs">Graham</p>
              <p>√(22.5 × 3.50 × 18) = R$ 35,55</p>
            </div>
            <div
              class="rounded-lg p-3"
              :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 75%, ' + brand.colors.background + ')' }"
            >
              <p class="text-xs">Bazin</p>
              <p>1.80 ÷ 0.06 = R$ 30,00</p>
            </div>
            <div
              class="rounded-lg p-3"
              :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 75%, ' + brand.colors.background + ')' }"
            >
              <p class="text-xs">P/L Setorial</p>
              <p>3.50 × 10 = R$ 35,00</p>
            </div>
            <div
              class="rounded-lg p-3"
              :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 75%, ' + brand.colors.background + ')' }"
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
            backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
            borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
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
              :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 75%, ' + brand.colors.background + ')' }"
            >
              <p class="text-xs">Graham</p>
              <p>√(22.5 × 8 × 35) = R$ 79,37</p>
            </div>
            <div
              class="rounded-lg p-3"
              :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 75%, ' + brand.colors.background + ')' }"
            >
              <p class="text-xs">Bazin</p>
              <p>5 ÷ 0.06 = R$ 83,33</p>
            </div>
            <div
              class="rounded-lg p-3"
              :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 75%, ' + brand.colors.background + ')' }"
            >
              <p class="text-xs">P/L Setorial</p>
              <p>8 × 6 = R$ 48,00</p>
            </div>
            <div
              class="rounded-lg p-3"
              :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 75%, ' + brand.colors.background + ')' }"
            >
              <p class="text-xs">Valor Patrimonial</p>
              <p>35 × 1.5 = R$ 52,50</p>
            </div>
          </div>
          <div class="mt-4 rounded-lg bg-green-500/20 p-3">
            <p class="text-sm text-green-400">
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

        <h2>Limitações e Quando NÃO Usar</h2>
        <div class="space-y-3">
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: 'color-mix(in srgb, #ef4444 25%, transparent)',
              backgroundColor: 'color-mix(in srgb, #ef4444 8%, transparent)',
            }"
          >
            <h4 class="mb-1" :style="{ color: '#f87171' }">Empresas de Crescimento (Growth)</h4>
            <p class="text-sm">
              Empresas como Magazine Luiza, Mercado Livre, que crescem rápido mas têm lucro baixo ou prejuízo, não funcionam bem com essas fórmulas. Prefira análise de múltiplos de receita ou fluxo de caixa descontado.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: 'color-mix(in srgb, #ef4444 25%, transparent)',
              backgroundColor: 'color-mix(in srgb, #ef4444 8%, transparent)',
            }"
          >
            <h4 class="mb-1" :style="{ color: '#f87171' }">Empresas com Prejuízo</h4>
            <p class="text-sm">
              Se o LPA é negativo, as fórmulas não funcionam. A empresa pode estar em reestruturação ou em setor cíclico no momento ruim.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: 'color-mix(in srgb, #ef4444 25%, transparent)',
              backgroundColor: 'color-mix(in srgb, #ef4444 8%, transparent)',
            }"
          >
            <h4 class="mb-1" :style="{ color: '#f87171' }">Setores Muito Cíclicos</h4>
            <p class="text-sm">
              Commodities (mineração, siderurgia) têm lucros que variam muito. Use LPA médio de vários anos ou análise de ciclos.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: 'color-mix(in srgb, #ef4444 25%, transparent)',
              backgroundColor: 'color-mix(in srgb, #ef4444 8%, transparent)',
            }"
          >
            <h4 class="mb-1" :style="{ color: '#f87171' }">Empresas com Dívida Altíssima</h4>
            <p class="text-sm">
              Se a empresa está super endividada, o valor patrimonial pode estar inflado. Verifique Dívida Líquida / EBITDA antes.
            </p>
          </div>
        </div>

        <h2>Perguntas Frequentes</h2>

        <div class="space-y-4">
          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Qual a melhor metodologia: Graham ou Bazin?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Depende do seu perfil. Bazin é ideal para quem busca renda passiva com dividendos e foca em empresas consolidadas. Graham é mais conservador e equilibra lucro com patrimônio, sendo bom para quem busca segurança. Na prática, use as duas e compare com P/L setorial para ter uma visão completa.
            </p>
          </details>

          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Se a ação está abaixo do preço teto, é garantia de boa compra?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Não! O preço teto é um filtro inicial, não uma garantia. A ação pode estar "barata" porque o mercado antecipa problemas futuros: concorrência aumentando, setor em declínio, gestão ruim, mudanças regulatórias etc. Sempre analise o porquê a ação está abaixo do teto antes de comprar. Pode ser oportunidade ou "value trap" (armadilha de valor).
            </p>
          </details>

          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Como calcular a margem de segurança?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Margem de Segurança = (Preço Teto - Preço Atual) ÷ Preço Teto × 100. Por exemplo: se o teto é R$ 40 e a ação está R$ 30, margem = (40-30)/40 = 25%. Graham sugeria mínimo de 20-30% de margem para investir com segurança. Quanto maior a margem, menor o risco de erro de análise.
            </p>
          </details>

          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Vale usar preço teto para small caps?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Sim, mas com cautela. Small caps tendem a ter P/L mais alto porque o mercado paga pelo crescimento futuro. Use P/L setorial de small caps (pode ser 15-20 ao invés de 10-12). Além disso, small caps têm maior risco de liquidez e volatilidade, então exija margem de segurança maior (30-40%) e diversifique bem.
            </p>
          </details>

          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              E para empresas de crescimento como Magazine Luiza?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Essas fórmulas tradicionais não funcionam bem para growth stocks. Empresas que reinvestem todo lucro no crescimento têm LPA baixo ou negativo, mas podem ter ótimo futuro. Para essas, use: múltiplos de receita (P/S ou EV/Sales), análise de fluxo de caixa descontado (DCF), comparação com pares de mercado ou múltiplos de EBITDA. Ou aguarde a empresa amadurecer e começar a gerar lucro consistente.
            </p>
          </details>

          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Com que frequência devo recalcular o preço teto?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Recalcule trimestralmente, após cada balanço da empresa. Os indicadores (LPA, VPA, dividendos) mudam a cada trimestre. Se você acompanha a empresa de perto, faça isso a cada 3 meses. Se é investidor de longo prazo, uma vez por ano pode ser suficiente. O importante é não se guiar apenas por um cálculo antigo, os fundamentos mudam.
            </p>
          </details>

          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Preço teto funciona para FIIs também?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Sim, mas adaptado. Para FIIs, use principalmente o Método Bazin (Dividendo ÷ Yield Mínimo) e análise de Preço / Valor Patrimonial (P/VP). FIIs devem negociar próximo ou abaixo do valor patrimonial. Um bom FII tem: P/VP < 1.0, Dividend Yield > 8%, vacância baixa, boa localização e gestão competente. A fórmula de Graham não se aplica bem porque FIIs não têm "lucro" tradicional.
            </p>
          </details>

          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              O que fazer se as 4 metodologias derem resultados muito diferentes?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Isso é comum e normal! Cada método olha a empresa por um ângulo. Se Graham diz R$ 40, Bazin R$ 60, P/L R$ 35 e VPA R$ 25, analise: a empresa paga bons dividendos (por isso Bazin é alto), tem muito ativo (por isso VPA é baixo relativo). Entenda o que cada número está dizendo. Use a média com peso: dê mais importância ao método que faz mais sentido para aquela empresa específica. Bancos = VPA + P/L. Pagadoras de dividendos = Bazin. Industriais = Graham.
            </p>
          </details>

          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Onde encontro o P/L médio do setor?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Use a ferramenta de busca da Redentia: filtre por setor e pegue o P/L de 5-10 empresas comparáveis, depois calcule a média. Exemplos de P/L médio: Bancos (8-12), Energia (10-14), Varejo (12-18), Tecnologia (20-30), Seguradoras (8-10). Setores cíclicos tendem a ter P/L mais baixo, setores de crescimento mais alto.
            </p>
          </details>

          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Posso usar LPA projetado ao invés de histórico?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Pode, mas com muita cautela. Projeções são incertas, analistas erram muito. Se você usar LPA projetado, use uma média das projeções de vários analistas (consenso de mercado) e aplique um desconto de segurança adicional (20-30%). Prefira sempre dados concretos e históricos. Se quiser considerar crescimento futuro, melhor usar fluxo de caixa descontado (DCF) que é mais apropriado para incorporar projeções.
            </p>
          </details>
        </div>

        <h2>Dicas para Investir com Preço Teto</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
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

      <!-- Calculadoras Relacionadas -->
      <div
        class="flex flex-col gap-4 rounded-[30px] p-6"
        :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"
      >
        <h2>Outras Ferramentas</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/dividend-yield"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
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
  authStore.isAuthenticated ? 'default' : 'static'
)
const { getAssets, getSectors } = useAssetsService()

const [{ data: assetsData, pending: assetsPending }, { data: sectorsData }] = await Promise.all([
  useAsyncData('assets-calculator-preco-teto', () => getAssets()),
  useAsyncData('sectors-calculator-preco-teto', () => getSectors().catch(() => [])),
])

const assets = computed(() => assetsData.value ?? [])
const assetsLoading = computed(() => assetsPending.value)
const sectors = computed(() => sectorsData.value ?? [])

const popularTickers = [
  { ticker: 'PETR4', name: 'Petrobras' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco' },
  { ticker: 'VALE3', name: 'Vale' },
  { ticker: 'BBAS3', name: 'Banco do Brasil' },
  { ticker: 'BBDC4', name: 'Bradesco' },
  { ticker: 'WEGE3', name: 'WEG' },
  { ticker: 'ITSA4', name: 'Itaúsa' },
  { ticker: 'B3SA3', name: 'B3' },
  { ticker: 'MGLU3', name: 'Magazine Luiza' },
  { ticker: 'ABEV3', name: 'Ambev' },
  { ticker: 'SUZB3', name: 'Suzano' },
  { ticker: 'RENT3', name: 'Localiza' },
]

const pageTitle = `Calculadora de Preço Teto 2026: Graham, Bazin, P/L e VPA | ${brand.name}`
const pageDescription =
  'Calculadora gratuita de preço teto de ações da B3. Escolha o ticker e veja na hora o preço justo por Graham, Bazin, P/L setorial e VPA, com margem de segurança, consenso e recomendação de compra. Dados atualizados, sem planilha, sem cadastro.'

const faqItems = [
  {
    q: 'O que é preço teto e por que calcular?',
    a: 'Preço teto é o valor máximo que um investidor deveria pagar por uma ação considerando seus fundamentos e uma margem de segurança. É a referência central da análise fundamentalista: se a ação estiver negociando abaixo do preço teto, pode estar barata; se estiver acima, pode estar cara.',
  },
  {
    q: 'Qual a melhor metodologia: Graham ou Bazin?',
    a: 'Depende do perfil. Bazin é ideal para quem busca renda passiva com dividendos e exige DY mínimo de 6% ao ano. Graham é mais conservador e equilibra lucro e patrimônio líquido, sendo ideal para empresas maduras e rentáveis. Na prática, use as duas e compare com P/L setorial e VPA para ter uma visão completa.',
  },
  {
    q: 'Se a ação está abaixo do preço teto, é garantia de boa compra?',
    a: 'Não. O preço teto é um filtro inicial, não uma garantia. A ação pode estar barata porque o mercado antecipa problemas: queda de lucro, concorrência, setor em declínio ou mudança regulatória. Sempre investigue o porquê antes de comprar, para evitar caírem uma "value trap" (armadilha de valor).',
  },
  {
    q: 'Como calcular a margem de segurança?',
    a: 'Margem de Segurança = (Preço Teto − Preço Atual) ÷ Preço Teto × 100. Se o teto é R$ 40 e a ação está R$ 30, a margem é de 25%. Benjamin Graham sugeria no mínimo 20% a 30% de margem para investir com segurança. Quanto maior a margem, menor o risco de erro de análise.',
  },
  {
    q: 'A calculadora serve para FIIs (Fundos Imobiliários)?',
    a: 'Parcialmente. Para FIIs use principalmente o Método Bazin (Dividendo ÷ Yield mínimo) e a análise de P/VP. Um bom FII costuma ter P/VP abaixo de 1,0, DY acima de 8% e vacância baixa. A fórmula de Graham não se aplica bem porque FIIs não têm "lucro" tradicional.',
  },
  {
    q: 'E para empresas de crescimento como Magazine Luiza?',
    a: 'As fórmulas tradicionais de preço teto não capturam bem growth stocks. Empresas que reinvestem todo o lucro têm LPA baixo ou negativo, mas podem ter um futuro excelente. Para essas, prefira múltiplos de receita (P/S ou EV/Sales), fluxo de caixa descontado (DCF) ou comparação com pares de mercado.',
  },
  {
    q: 'Com que frequência devo recalcular o preço teto?',
    a: 'Recalcule trimestralmente, após cada balanço da empresa. LPA, VPA e dividendos mudam a cada trimestre. Se você acompanha a empresa de perto, revise a cada 3 meses. Para investidores de longo prazo, uma vez por ano pode bastar, desde que não haja eventos materiais no meio do caminho.',
  },
  {
    q: 'De onde vêm os dados da calculadora?',
    a: `A ${brand.name} utiliza dados públicos da B3 (Bolsa brasileira), Comissão de Valores Mobiliários (CVM) e demonstrações financeiras oficiais das empresas, atualizados automaticamente após cada pregão e divulgação de balanço.`,
  },
  {
    q: 'Vale usar preço teto para small caps?',
    a: 'Sim, com cautela. Small caps tendem a ter P/L mais alto porque o mercado paga pelo crescimento futuro. Use P/L setorial ajustado para small caps (15-20), exija margem de segurança maior (30-40%) e diversifique, já que esses papéis têm volatilidade e risco de liquidez maiores.',
  },
  {
    q: 'O que fazer se as 4 metodologias derem resultados muito diferentes?',
    a: 'É normal. Cada método olha a empresa por um ângulo. Se Graham, Bazin, P/L e VPA divergem bastante, dê mais peso ao método que faz mais sentido para aquela empresa: bancos tendem a responder bem a VPA e P/L, pagadoras de dividendos ao Bazin, industriais a Graham. Use a média ponderada como consenso.',
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
      '@type': 'SoftwareApplication',
      name: `Calculadora de Preço Teto ${brand.name}`,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Análise fundamentalista',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '1824',
        bestRating: '5',
        worstRating: '1',
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
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline:
        'Calculadora de Preço Teto: Graham, Bazin, P/L Setorial e VPA',
      description: pageDescription,
      author: {
        '@type': 'Organization',
        name: brand.name,
        url: brand.url,
      },
      publisher: {
        '@type': 'Organization',
        name: brand.name,
        url: brand.url,
        logo: {
          '@type': 'ImageObject',
          url: `${brand.url || ''}/512x512.png`,
        },
      },
      inLanguage: 'pt-BR',
      datePublished: '2024-06-01',
      dateModified: new Date().toISOString().slice(0, 10),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${brand.url || ''}/calculadora/preco-teto`,
      },
      about: [
        { '@type': 'Thing', name: 'Análise fundamentalista' },
        { '@type': 'Thing', name: 'Value investing' },
        { '@type': 'Thing', name: 'Preço justo de ações' },
        { '@type': 'Person', name: 'Benjamin Graham' },
        { '@type': 'Person', name: 'Décio Bazin' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Como calcular o preço teto de uma ação',
      description:
        'Passo a passo para calcular o preço teto de qualquer ação da B3 usando Graham, Bazin, P/L setorial e valor patrimonial.',
      totalTime: 'PT2M',
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'BRL',
        value: '0',
      },
      supply: [
        { '@type': 'HowToSupply', name: 'LPA (Lucro por Ação)' },
        { '@type': 'HowToSupply', name: 'VPA (Valor Patrimonial por Ação)' },
        { '@type': 'HowToSupply', name: 'Dividendos dos últimos 12 meses' },
        { '@type': 'HowToSupply', name: 'P/L médio do setor' },
      ],
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Escolha a ação',
          text: 'Digite o ticker da ação (ex.: PETR4, ITUB4, VALE3) no campo de busca da calculadora.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Receba os fundamentos automaticamente',
          text: 'A calculadora busca preço atual, LPA, VPA, dividendo anual e P/L do setor automaticamente a partir de fontes oficiais.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Analise as 4 metodologias',
          text: 'Graham (conservador), Bazin (dividendos), P/L Setorial (relativo) e VPA (patrimonial) são calculados simultaneamente.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Leia o consenso e a margem',
          text: 'Veja a média dos preços teto, a margem de segurança em relação ao preço atual e a recomendação final: Comprar, Neutro ou Caro.',
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'Combine com outros indicadores',
          text: 'Confira ROE, endividamento, crescimento de receita e perspectivas do setor antes de tomar a decisão final de compra.',
        },
      ],
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

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})
</script>

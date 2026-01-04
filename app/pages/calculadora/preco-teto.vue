<template>
  <NuxtLayout name="static" title="Calculadora de Preço Teto">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm text-gray-400">
        <NuxtLink to="/" class="hover:text-white transition-colors">
          Home
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
        <NuxtLink to="/calculadora" class="hover:text-white transition-colors">
          Calculadoras
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
        <span class="text-white">Preço Teto</span>
      </nav>

      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-target" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">
            Calculadora de Preço Teto: Graham, Bazin e Mais
          </h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Calcule o preço justo de ações usando as metodologias de Benjamin Graham, Décio Bazin, P/L setorial e valor patrimonial. Descubra se uma ação está barata ou cara antes de investir.
        </p>
      </div>

      <!-- Calculadora -->
      <CalculatorFairPrice :assets="assets" :assets-loading="assetsLoading" />

      <!-- Conteúdo Educacional -->
      <div class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold">O que é Preço Teto?</h2>
        <p class="leading-relaxed text-gray-300">
          O preço teto é o valor máximo que você deveria pagar por uma ação, considerando seus fundamentos e uma margem de segurança. É um conceito fundamental da análise fundamentalista, popularizado por Benjamin Graham (o "pai do value investing") e adaptado por investidores brasileiros como Décio Bazin.
        </p>
        <p class="leading-relaxed text-gray-300">
          Diferente de apenas olhar o preço atual da ação, o preço teto considera indicadores como lucro, patrimônio, dividendos e múltiplos do setor para determinar um valor justo. Se a ação estiver abaixo do preço teto, pode ser uma boa oportunidade de compra. Se estiver acima, pode estar cara.
        </p>

        <h2 class="text-2xl font-bold">Metodologias de Cálculo</h2>

        <h3 class="text-xl font-semibold">1. Fórmula de Benjamin Graham</h3>
        <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg font-semibold">
            Preço Teto = √(22.5 × LPA × VPA)
          </p>
          <div class="mt-4 space-y-2 text-sm text-gray-300">
            <p><strong>LPA</strong> = Lucro por Ação (últimos 12 meses)</p>
            <p><strong>VPA</strong> = Valor Patrimonial por Ação</p>
            <p><strong>22.5</strong> = Constante de Graham (P/L 15 × P/VP 1.5)</p>
          </div>
        </div>
        <p class="leading-relaxed text-gray-300">
          Graham defendia que empresas deveriam ser compradas com P/L máximo de 15 e P/VP máximo de 1.5. A fórmula combina esses dois critérios em um único número. É ideal para empresas maduras e lucrativas.
        </p>

        <h3 class="text-xl font-semibold">2. Método Bazin (Dividendos)</h3>
        <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg font-semibold">
            Preço Teto = Dividendo Anual ÷ 0.06
          </p>
          <div class="mt-4 space-y-2 text-sm text-gray-300">
            <p><strong>Dividendo Anual</strong> = Soma dos dividendos por ação nos últimos 12 meses</p>
            <p><strong>0.06 (6%)</strong> = Dividend Yield mínimo aceitável segundo Bazin</p>
          </div>
        </div>
        <p class="leading-relaxed text-gray-300">
          Décio Bazin focava em dividendos consistentes. Segundo ele, uma ação só vale a pena se pagar pelo menos 6% de dividend yield. O método é excelente para quem busca renda passiva e empresas consolidadas que distribuem lucros regularmente.
        </p>

        <h3 class="text-xl font-semibold">3. P/L Setorial</h3>
        <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg font-semibold">
            Preço Teto = LPA × P/L Médio do Setor
          </p>
          <div class="mt-4 space-y-2 text-sm text-gray-300">
            <p><strong>P/L Médio</strong> = Média do Price/Earnings ratio das empresas do mesmo setor</p>
          </div>
        </div>
        <p class="leading-relaxed text-gray-300">
          Cada setor tem um P/L considerado "normal". Bancos costumam ter P/L de 8-12, enquanto tecnologia pode ter 20-30. Comparar com o setor evita julgar uma empresa por padrões inadequados.
        </p>

        <h3 class="text-xl font-semibold">4. Valor Patrimonial (Graham Modificado)</h3>
        <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg font-semibold">
            Preço Teto = VPA × 1.5
          </p>
          <div class="mt-4 space-y-2 text-sm text-gray-300">
            <p><strong>VPA</strong> = Patrimônio Líquido ÷ Número de Ações</p>
            <p><strong>1.5</strong> = Margem máxima sobre valor contábil (Graham)</p>
          </div>
        </div>
        <p class="leading-relaxed text-gray-300">
          Graham sugeria não pagar mais que 1.5x o valor patrimonial. Útil para empresas com muitos ativos tangíveis (bancos, seguradoras, indústrias). Menos efetivo para empresas de serviço ou tecnologia.
        </p>

        <h2 class="text-2xl font-bold">Exemplos Práticos</h2>

        <h3 class="text-xl font-semibold">Exemplo 1: Itaú Unibanco (ITUB4)</h3>
        <div class="rounded-xl border border-white/10 bg-white/5 p-5">
          <h4 class="mb-3 font-semibold">Dados (valores ilustrativos):</h4>
          <ul class="mb-4 space-y-1 text-sm text-gray-300">
            <li>Preço atual: R$ 28,00</li>
            <li>LPA: R$ 3,50</li>
            <li>VPA: R$ 18,00</li>
            <li>Dividendo anual: R$ 1,80</li>
            <li>P/L médio setor bancário: 10</li>
          </ul>
          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-lg bg-white/10 p-3">
              <p class="text-xs text-gray-400">Graham</p>
              <p class="font-semibold">√(22.5 × 3.50 × 18) = R$ 35,55</p>
            </div>
            <div class="rounded-lg bg-white/10 p-3">
              <p class="text-xs text-gray-400">Bazin</p>
              <p class="font-semibold">1.80 ÷ 0.06 = R$ 30,00</p>
            </div>
            <div class="rounded-lg bg-white/10 p-3">
              <p class="text-xs text-gray-400">P/L Setorial</p>
              <p class="font-semibold">3.50 × 10 = R$ 35,00</p>
            </div>
            <div class="rounded-lg bg-white/10 p-3">
              <p class="text-xs text-gray-400">Valor Patrimonial</p>
              <p class="font-semibold">18 × 1.5 = R$ 27,00</p>
            </div>
          </div>
          <div class="mt-4 rounded-lg bg-secondary/20 p-3">
            <p class="text-sm font-semibold text-secondary">
              Preço Teto Médio: R$ 31,89
            </p>
            <p class="text-xs text-gray-300 mt-1">
              Preço atual (R$ 28,00) está 12% abaixo do teto médio. Boa margem de segurança!
            </p>
          </div>
        </div>

        <h3 class="text-xl font-semibold">Exemplo 2: Petrobras (PETR4)</h3>
        <div class="rounded-xl border border-white/10 bg-white/5 p-5">
          <h4 class="mb-3 font-semibold">Dados (valores ilustrativos):</h4>
          <ul class="mb-4 space-y-1 text-sm text-gray-300">
            <li>Preço atual: R$ 38,00</li>
            <li>LPA: R$ 8,00</li>
            <li>VPA: R$ 35,00</li>
            <li>Dividendo anual: R$ 5,00</li>
            <li>P/L médio setor petróleo: 6</li>
          </ul>
          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-lg bg-white/10 p-3">
              <p class="text-xs text-gray-400">Graham</p>
              <p class="font-semibold">√(22.5 × 8 × 35) = R$ 79,37</p>
            </div>
            <div class="rounded-lg bg-white/10 p-3">
              <p class="text-xs text-gray-400">Bazin</p>
              <p class="font-semibold">5 ÷ 0.06 = R$ 83,33</p>
            </div>
            <div class="rounded-lg bg-white/10 p-3">
              <p class="text-xs text-gray-400">P/L Setorial</p>
              <p class="font-semibold">8 × 6 = R$ 48,00</p>
            </div>
            <div class="rounded-lg bg-white/10 p-3">
              <p class="text-xs text-gray-400">Valor Patrimonial</p>
              <p class="font-semibold">35 × 1.5 = R$ 52,50</p>
            </div>
          </div>
          <div class="mt-4 rounded-lg bg-green-500/20 p-3">
            <p class="text-sm font-semibold text-green-400">
              Preço Teto Médio: R$ 65,80
            </p>
            <p class="text-xs text-gray-300 mt-1">
              Preço atual (R$ 38,00) está 42% abaixo do teto médio. Excelente oportunidade segundo as métricas!
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Como Usar a Calculadora</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              1
            </div>
            <div>
              <h4 class="font-semibold">Reúna os Dados da Ação</h4>
              <p class="text-sm text-gray-300">
                Acesse o site de RI da empresa ou plataformas como Status Invest, Fundamentus ou a própria B3. Você precisa de: LPA, VPA, dividendos dos últimos 12 meses e P/L médio do setor.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              2
            </div>
            <div>
              <h4 class="font-semibold">Preencha os Campos</h4>
              <p class="text-sm text-gray-300">
                Insira ticker, preço atual e os indicadores. Use valores dos últimos 12 meses (TTM - Trailing Twelve Months) para maior precisão.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              3
            </div>
            <div>
              <h4 class="font-semibold">Analise as 4 Metodologias</h4>
              <p class="text-sm text-gray-300">
                Cada método tem seus pontos fortes. Graham é conservador, Bazin foca dividendos, P/L setorial contextualiza, e VPA é bom para empresas com ativos.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              4
            </div>
            <div>
              <h4 class="font-semibold">Veja o Consenso</h4>
              <p class="text-sm text-gray-300">
                A média das metodologias fornece uma visão balanceada. Se a maioria indicar "Barato", a ação pode estar em bom momento de compra.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              5
            </div>
            <div>
              <h4 class="font-semibold">Analise Outros Fundamentos</h4>
              <p class="text-sm text-gray-300">
                Preço teto é um filtro, não a decisão final. Avalie também: endividamento, ROE, crescimento de receita, perspectivas do setor e qualidade da gestão.
              </p>
            </div>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Limitações e Quando NÃO Usar</h2>
        <div class="space-y-3">
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 font-semibold text-red-400">❌ Empresas de Crescimento (Growth)</h4>
            <p class="text-sm text-gray-300">
              Empresas como Magazine Luiza, Mercado Livre, que crescem rápido mas têm lucro baixo ou prejuízo, não funcionam bem com essas fórmulas. Prefira análise de múltiplos de receita ou fluxo de caixa descontado.
            </p>
          </div>
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 font-semibold text-red-400">❌ Empresas com Prejuízo</h4>
            <p class="text-sm text-gray-300">
              Se o LPA é negativo, as fórmulas não funcionam. A empresa pode estar em reestruturação ou em setor cíclico no momento ruim.
            </p>
          </div>
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 font-semibold text-red-400">❌ Setores Muito Cíclicos</h4>
            <p class="text-sm text-gray-300">
              Commodities (mineração, siderurgia) têm lucros que variam muito. Use LPA médio de vários anos ou análise de ciclos.
            </p>
          </div>
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 font-semibold text-red-400">❌ Empresas com Dívida Altíssima</h4>
            <p class="text-sm text-gray-300">
              Se a empresa está super endividada, o valor patrimonial pode estar inflado. Verifique Dívida Líquida / EBITDA antes.
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Perguntas Frequentes</h2>
        
        <div class="space-y-4">
          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Qual a melhor metodologia: Graham ou Bazin?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Depende do seu perfil. Bazin é ideal para quem busca renda passiva com dividendos e foca em empresas consolidadas. Graham é mais conservador e equilibra lucro com patrimônio, sendo bom para quem busca segurança. Na prática, use as duas e compare com P/L setorial para ter uma visão completa.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Se a ação está abaixo do preço teto, é garantia de boa compra?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Não! O preço teto é um filtro inicial, não uma garantia. A ação pode estar "barata" porque o mercado antecipa problemas futuros: concorrência aumentando, setor em declínio, gestão ruim, mudanças regulatórias etc. Sempre analise o porquê a ação está abaixo do teto antes de comprar. Pode ser oportunidade ou "value trap" (armadilha de valor).
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Como calcular a margem de segurança?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Margem de Segurança = (Preço Teto - Preço Atual) ÷ Preço Teto × 100. Por exemplo: se o teto é R$ 40 e a ação está R$ 30, margem = (40-30)/40 = 25%. Graham sugeria mínimo de 20-30% de margem para investir com segurança. Quanto maior a margem, menor o risco de erro de análise.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Vale usar preço teto para small caps?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Sim, mas com cautela. Small caps tendem a ter P/L mais alto porque o mercado paga pelo crescimento futuro. Use P/L setorial de small caps (pode ser 15-20 ao invés de 10-12). Além disso, small caps têm maior risco de liquidez e volatilidade, então exija margem de segurança maior (30-40%) e diversifique bem.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              E para empresas de crescimento como Magazine Luiza?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Essas fórmulas tradicionais não funcionam bem para growth stocks. Empresas que reinvestem todo lucro no crescimento têm LPA baixo ou negativo, mas podem ter ótimo futuro. Para essas, use: múltiplos de receita (P/S ou EV/Sales), análise de fluxo de caixa descontado (DCF), comparação com pares de mercado ou múltiplos de EBITDA. Ou aguarde a empresa amadurecer e começar a gerar lucro consistente.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Com que frequência devo recalcular o preço teto?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Recalcule trimestralmente, após cada balanço da empresa. Os indicadores (LPA, VPA, dividendos) mudam a cada trimestre. Se você acompanha a empresa de perto, faça isso a cada 3 meses. Se é investidor de longo prazo, uma vez por ano pode ser suficiente. O importante é não se guiar apenas por um cálculo antigo - os fundamentos mudam.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Preço teto funciona para FIIs também?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Sim, mas adaptado. Para FIIs, use principalmente o Método Bazin (Dividendo ÷ Yield Mínimo) e análise de Preço / Valor Patrimonial (P/VP). FIIs devem negociar próximo ou abaixo do valor patrimonial. Um bom FII tem: P/VP < 1.0, Dividend Yield > 8%, vacância baixa, boa localização e gestão competente. A fórmula de Graham não se aplica bem porque FIIs não têm "lucro" tradicional.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              O que fazer se as 4 metodologias derem resultados muito diferentes?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Isso é comum e normal! Cada método olha a empresa por um ângulo. Se Graham diz R$ 40, Bazin R$ 60, P/L R$ 35 e VPA R$ 25, analise: a empresa paga bons dividendos (por isso Bazin é alto), tem muito ativo (por isso VPA é baixo relativo). Entenda o que cada número está dizendo. Use a média com peso: dê mais importância ao método que faz mais sentido para aquela empresa específica. Bancos = VPA + P/L. Pagadoras de dividendos = Bazin. Industriais = Graham.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Onde encontro o P/L médio do setor?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Sites como Status Invest, Fundamentus e EconomaticaExcel mostram P/L por setor. Ou faça manualmente: pegue 5-10 empresas do mesmo setor, veja o P/L de cada, e calcule a média. Exemplos de P/L médio: Bancos (8-12), Energia (10-14), Varejo (12-18), Tecnologia (20-30), Seguradoras (8-10). Setores cíclicos tendem a ter P/L mais baixo, setores de crescimento mais alto.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Posso usar LPA projetado ao invés de histórico?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Pode, mas com muita cautela. Projeções são incertas - analistas erram muito. Se você usar LPA projetado, use uma média das projeções de vários analistas (consenso de mercado) e aplique um desconto de segurança adicional (20-30%). Prefira sempre dados concretos e históricos. Se quiser considerar crescimento futuro, melhor usar fluxo de caixa descontado (DCF) que é mais apropriado para incorporar projeções.
            </p>
          </details>
        </div>

        <h2 class="text-2xl font-bold">Dicas para Investir com Preço Teto</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              1. Use Como Filtro Inicial
            </h4>
            <p class="text-sm text-gray-300">
              Calcule o preço teto de 10-20 ações que você gosta. Descarte as que estão muito acima do teto. Foque análise profunda nas que estão abaixo.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              2. Combine com Outros Indicadores
            </h4>
            <p class="text-sm text-gray-300">
              Não use apenas preço teto. Veja também: ROE > 15%, Dívida/EBITDA < 3, Crescimento de receita > 5% a.a., Payout sustentável.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              3. Exija Margem de Segurança
            </h4>
            <p class="text-sm text-gray-300">
              Nunca compre no preço teto ou acima. Espere pelo menos 20% de margem. Em momentos de crise, você pode conseguir 40-50% de desconto.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              4. Reavalie Periodicamente
            </h4>
            <p class="text-sm text-gray-300">
              Fundamentos mudam. Uma ação que estava barata pode ficar cara se o lucro cair. Recalcule após cada balanço trimestral.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              5. Entenda o "Por Quê"
            </h4>
            <p class="text-sm text-gray-300">
              Se uma ação está 50% abaixo do preço teto, investigue o porquê. Pode ser oportunidade ou problema real que o mercado já precificou.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              6. Seja Paciente
            </h4>
            <p class="text-sm text-gray-300">
              Value investing exige paciência. Pode levar meses ou anos para o mercado reconhecer o valor. Não espere ganhos rápidos.
            </p>
          </div>
        </div>
      </div>

      <!-- Calculadoras Relacionadas -->
      <div class="flex flex-col gap-4 rounded-[30px] bg-white/5 p-6">
        <h2 class="text-2xl font-bold">Outras Ferramentas</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/dividend-yield"
            class="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-secondary/50"
          >
            <UIcon
              name="i-lucide-coins"
              class="text-secondary size-8 shrink-0"
            />
            <div>
              <h3 class="font-semibold">Calculadora de Dividend Yield</h3>
              <p class="text-sm text-gray-400">
                Calcule DY atual e projetado
              </p>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/calculadora/acoes"
            class="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-secondary/50"
          >
            <UIcon
              name="i-lucide-chart-line"
              class="text-secondary size-8 shrink-0"
            />
            <div>
              <h3 class="font-semibold">Simulador de Ações</h3>
              <p class="text-sm text-gray-400">
                Histórico real de investimentos
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- CTA -->
      <MoleculesCtaSection
        title="Analise Ações na Redentia"
        description="Acesse dados fundamentalistas em tempo real, compare indicadores e receba análises com IA."
        primary-button-text="Criar conta grátis"
        primary-button-link="/auth/register"
        secondary-button-text="Ver ações"
        secondary-button-link="/acoes"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAssetsService } from '~/services/assets'

const { getAssets } = useAssetsService()
const { data: assetsData, pending: assetsPending } = await useAsyncData(
  'assets-calculator-preco-teto',
  () => getAssets()
)

const assets = computed(() => assetsData.value ?? [])
const assetsLoading = computed(() => assetsPending.value)

usePageSeo({
  title: 'Calculadora de Preço Teto: Graham, Bazin, P/L e VPA | Redentia',
  description:
    'Calcule o preço justo de ações usando as metodologias de Benjamin Graham, Décio Bazin, P/L setorial e valor patrimonial. Descubra se uma ação está barata ou cara antes de investir.',
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
      name: 'Calculadora de Preço Teto Redentia',
      applicationCategory: 'FinanceApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      operatingSystem: 'Web',
      description:
        'Calculadora gratuita de preço teto para ações usando metodologias de Graham, Bazin, P/L setorial e valor patrimonial.',
      featureList: [
        'Fórmula de Benjamin Graham',
        'Método Bazin de dividendos',
        'P/L setorial',
        'Análise de valor patrimonial',
        'Margem de segurança',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Qual a melhor metodologia: Graham ou Bazin?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Depende do seu perfil. Bazin é ideal para quem busca renda passiva com dividendos. Graham é mais conservador e equilibra lucro com patrimônio. Use ambas e compare.',
          },
        },
        {
          '@type': 'Question',
          name: 'Se a ação está abaixo do preço teto, é garantia de boa compra?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não! O preço teto é um filtro inicial. A ação pode estar barata porque o mercado antecipa problemas futuros. Sempre analise fundamentos completos.',
          },
        },
        {
          '@type': 'Question',
          name: 'Como calcular a margem de segurança?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Margem de Segurança = (Preço Teto - Preço Atual) ÷ Preço Teto × 100. Graham sugeria mínimo de 20-30% de margem.',
          },
        },
      ],
    },
  ],
})

definePageMeta({
  isPublicRoute: true,
})
</script>

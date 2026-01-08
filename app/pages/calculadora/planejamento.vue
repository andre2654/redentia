<template>
  <NuxtLayout :name="layoutName" title="Calculadora de Planejamento Patrimonial">
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
        <span class="text-white">Planejamento Patrimonial</span>
      </nav>

      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-target" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">
            Calculadora de Planejamento Patrimonial: Alcance Suas Metas
          </h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Descubra quanto tempo e quanto investir para atingir suas metas financeiras. Receba uma carteira recomendada baseada em dados históricos reais da B3, com estratégias personalizadas de rentabilidade ou segurança.
        </p>
      </div>

      <!-- Calculadora -->
      <CalculatorPlanning :assets="assets" />

      <!-- Conteúdo Educacional -->
      <div class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold">O que é Planejamento Patrimonial?</h2>
        <p class="leading-relaxed text-gray-300">
          Planejamento patrimonial é o processo de definir metas financeiras claras e criar uma estratégia concreta para alcançá-las. Não basta apenas "investir" - você precisa saber exatamente quanto investir, por quanto tempo, e em quais ativos, para realizar seus objetivos.
        </p>
        <p class="leading-relaxed text-gray-300">
          Nossa calculadora vai além de simulações genéricas: ela analisa dados históricos reais de centenas de ativos da B3, monta uma carteira otimizada para seu perfil, e projeta quando você atingirá sua meta. Tudo baseado em performance real, não em promessas.
        </p>

        <h3 class="text-xl font-semibold">Por que Fazer um Planejamento Patrimonial?</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Clareza de Objetivos
            </h4>
            <p class="text-sm text-gray-300">
              Transforme sonhos vagos em metas concretas. "Quero ficar rico" vira "Preciso de R$ 500 mil em 15 anos investindo R$ 1.500/mês".
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Estratégia Realista
            </h4>
            <p class="text-sm text-gray-300">
              Baseada em dados reais, não em otimismo exagerado. Você saberá se sua meta é viável ou se precisa ajustar aportes/prazos.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Carteira Personalizada
            </h4>
            <p class="text-sm text-gray-300">
              Receba recomendações de ativos específicos, com pesos definidos, baseadas em performance histórica e seu perfil de risco.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Acompanhamento do Progresso
            </h4>
            <p class="text-sm text-gray-300">
              Com metas claras, você pode acompanhar seu progresso mensalmente e fazer ajustes conforme necessário.
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Como Usar a Calculadora de Planejamento</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              1
            </div>
            <div>
              <h4 class="font-semibold">Defina Sua Meta Financeira</h4>
              <p class="text-sm text-gray-300">
                Quanto você quer acumular? Pense em objetivos concretos: R$ 300 mil para entrada de um imóvel, R$ 1 milhão para aposentadoria, R$ 500 mil para liberdade financeira. Seja específico.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              2
            </div>
            <div>
              <h4 class="font-semibold">Defina Seu Aporte Mensal</h4>
              <p class="text-sm text-gray-300">
                Quanto você consegue investir todo mês de forma consistente? Seja realista - é melhor prometer menos e cumprir do que ser ambicioso e desistir. Lembre-se: consistência vence valor.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              3
            </div>
            <div>
              <h4 class="font-semibold">Escolha Sua Estratégia</h4>
              <p class="text-sm text-gray-300">
                <strong>Maior rentabilidade:</strong> Foca em ativos que tiveram melhor desempenho histórico (maior retorno, mas maior volatilidade). <strong>Maior segurança:</strong> Prioriza ativos defensivos e inclui renda fixa para estabilidade.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              4
            </div>
            <div>
              <h4 class="font-semibold">Analise os Resultados</h4>
              <p class="text-sm text-gray-300">
                Veja quanto tempo levará para atingir sua meta, a carteira recomendada com pesos específicos de cada ativo, projeção de patrimônio e comparação com dados históricos reais.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              5
            </div>
            <div>
              <h4 class="font-semibold">Execute e Monitore</h4>
              <p class="text-sm text-gray-300">
                Use a carteira recomendada como base, adapte conforme seu conhecimento e perfil, e revise trimestralmente. Ajuste aportes se sua renda mudar.
              </p>
            </div>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Estratégias de Planejamento</h2>

        <h3 class="text-xl font-semibold">Maior Rentabilidade</h3>
        <div class="rounded-xl border border-green-500/20 bg-green-500/10 p-5">
          <h4 class="mb-3 font-semibold text-green-400">
            Para quem: Investidores com tolerância a risco e horizonte longo (10+ anos)
          </h4>
          <p class="text-sm text-gray-300 mb-3">
            Esta estratégia seleciona ativos com melhor performance histórica, priorizando crescimento de capital. Pode ter maior volatilidade no curto prazo, mas tende a maximizar retornos no longo prazo.
          </p>
          <div class="space-y-2 text-sm">
            <p class="font-semibold text-white">Características:</p>
            <ul class="text-gray-300 space-y-1">
              <li>• 80-90% em ações de alto crescimento e blue chips</li>
              <li>• 10-20% em FIIs consolidados</li>
              <li>• Foco em setores com boas perspectivas futuras</li>
              <li>• Maior exposição a small caps de qualidade</li>
              <li>• Retorno histórico médio: 14-18% a.a.</li>
            </ul>
          </div>
        </div>

        <h3 class="text-xl font-semibold">Maior Segurança</h3>
        <div class="rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">
          <h4 class="mb-3 font-semibold text-blue-400">
            Para quem: Investidores conservadores ou próximos de usar o dinheiro (5-10 anos)
          </h4>
          <p class="text-sm text-gray-300 mb-3">
            Esta estratégia prioriza estabilidade e previsibilidade. Seleciona empresas consolidadas, setores defensivos e inclui renda fixa para reduzir volatilidade.
          </p>
          <div class="space-y-2 text-sm">
            <p class="font-semibold text-white">Características:</p>
            <ul class="text-gray-300 space-y-1">
              <li>• 50-60% em ações de setores defensivos (bancos, energia, saneamento)</li>
              <li>• 30-40% em FIIs consolidados e diversificados</li>
              <li>• 10% em renda fixa (Tesouro Direto, CDBs)</li>
              <li>• Foco em pagadores consistentes de dividendos</li>
              <li>• Retorno histórico médio: 10-13% a.a.</li>
            </ul>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Exemplos de Metas e Resultados</h2>

        <h3 class="text-xl font-semibold">Exemplo 1: Aposentadoria Antecipada</h3>
        <div class="space-y-3">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-2 font-semibold">João, 30 anos - Meta: R$ 1 milhão</h4>
            <ul class="text-sm text-gray-300 mb-3">
              <li>Aporte mensal: R$ 2.000</li>
              <li>Estratégia: Maior rentabilidade</li>
              <li>Horizonte: 20 anos</li>
            </ul>
            <div class="rounded-lg bg-secondary/20 p-3">
              <p class="text-sm font-semibold text-white">
                Resultado: Alcança meta em aproximadamente 18 anos
              </p>
              <p class="text-xs text-gray-400">
                Total investido: R$ 432.000 | Ganho projetado: R$ 568.000
              </p>
              <p class="text-xs text-gray-300 mt-2">
                Carteira sugerida: 40% ITUB4, 20% VALE3, 15% WEGE3, 15% PETR4, 10% BBDC4
              </p>
            </div>
          </div>
        </div>

        <h3 class="text-xl font-semibold">Exemplo 2: Entrada de Imóvel</h3>
        <div class="space-y-3">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-2 font-semibold">Maria, 25 anos - Meta: R$ 150.000</h4>
            <ul class="text-sm text-gray-300 mb-3">
              <li>Aporte mensal: R$ 1.500</li>
              <li>Estratégia: Maior rentabilidade</li>
              <li>Horizonte: 7 anos</li>
            </ul>
            <div class="rounded-lg bg-secondary/20 p-3">
              <p class="text-sm font-semibold text-white">
                Resultado: Alcança meta em aproximadamente 6,5 anos
              </p>
              <p class="text-xs text-gray-400">
                Total investido: R$ 117.000 | Ganho projetado: R$ 33.000
              </p>
              <p class="text-xs text-gray-300 mt-2">
                Carteira sugerida: 35% PETR4, 25% VALE3, 20% BBDC4, 20% WEGE3
              </p>
            </div>
          </div>
        </div>

        <h3 class="text-xl font-semibold">Exemplo 3: Renda Passiva para Aposentadoria</h3>
        <div class="space-y-3">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-2 font-semibold">Carlos, 45 anos - Meta: R$ 800.000</h4>
            <ul class="text-sm text-gray-300 mb-3">
              <li>Aporte mensal: R$ 3.000</li>
              <li>Estratégia: Maior segurança</li>
              <li>Horizonte: 15 anos (aposentar aos 60)</li>
            </ul>
            <div class="rounded-lg bg-secondary/20 p-3">
              <p class="text-sm font-semibold text-white">
                Resultado: Alcança meta em aproximadamente 14 anos
              </p>
              <p class="text-xs text-gray-400">
                Total investido: R$ 540.000 | Ganho projetado: R$ 260.000
              </p>
              <p class="text-xs text-gray-300 mt-2">
                Carteira sugerida: 30% FIIs diversos, 25% ITUB4, 20% BBDC4, 15% PETR4, 10% Renda Fixa
              </p>
              <p class="text-xs text-gray-300 mt-1">
                Com R$ 800 mil gerando 10% a.a., terá R$ 6.600/mês de renda passiva
              </p>
            </div>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Como Interpretar a Carteira Recomendada</h2>
        <p class="leading-relaxed text-gray-300">
          A carteira recomendada mostra ativos específicos e seus pesos sugeridos. Veja o que cada informação significa:
        </p>

        <div class="space-y-3">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold text-secondary">Ticker e Nome</h4>
            <p class="text-sm text-gray-300">
              O código da ação (ex: PETR4) e nome da empresa. Use esses códigos para comprar na sua corretora.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold text-secondary">Peso (%)  </h4>
            <p class="text-sm text-gray-300">
              Quanto do seu aporte deve ir para cada ativo. Ex: Se você investe R$ 1.000/mês e PETR4 tem peso de 20%, deve comprar R$ 200 em PETR4 por mês.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold text-secondary">Retorno Histórico</h4>
            <p class="text-sm text-gray-300">
              Quanto o ativo rendeu no período analisado. Passado não garante futuro, mas mostra o potencial.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold text-secondary">CAGR (Retorno Anual Composto)</h4>
            <p class="text-sm text-gray-300">
              A taxa média anual de crescimento. É mais precisa que retorno total para comparar ativos.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold text-secondary">Dividendos Totais</h4>
            <p class="text-sm text-gray-300">
              Quanto você teria recebido em proventos reinvestidos ao longo do período. Muitas vezes representa 30-50% do retorno total.
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Perguntas Frequentes</h2>
        
        <div class="space-y-4">
          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              A carteira recomendada é garantida de funcionar?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Não há garantias no mercado financeiro. A carteira é baseada em performance histórica real, mas o futuro pode ser diferente. Use como ponto de partida, faça sua própria análise dos ativos e adapte conforme seu conhecimento e perfil de risco. Sempre diversifique e invista apenas o que você pode deixar investido no longo prazo.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Devo seguir a carteira exatamente como recomendada?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Use como referência, não como lei absoluta. Se você já possui alguns ativos, considere-os no planejamento. Se algum ativo recomendado não te agrada ou você não conhece bem, substitua por similar do mesmo setor. O importante é manter a diversificação entre setores e não concentrar demais em poucos ativos. Os pesos podem variar ±5-10% sem grande impacto.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Com que frequência devo revisar meu planejamento?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Revise seu planejamento a cada 6-12 meses, ou quando houver mudanças significativas (aumento de renda, mudança de meta, crise no mercado). No entanto, evite ficar alterando a carteira constantemente - isso gera custos e pode prejudicar o crescimento de longo prazo. Pequenas oscilações são normais e esperadas. Foque em manter a disciplina dos aportes mensais.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              O que fazer se eu não conseguir atingir minha meta no prazo desejado?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Você tem três opções: 1) Aumentar o aporte mensal, 2) Estender o prazo (mais tempo = mais juros compostos), 3) Reduzir a meta. Muitas vezes, aumentar o aporte em 20-30% pode encurtar o prazo em anos. Alternativamente, trabalhar mais 2-3 anos pode permitir você atingir uma meta maior. Seja realista e escolha o que cabe no seu orçamento e planos de vida.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Qual a diferença entre retorno total e CAGR?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Retorno total é quanto o ativo cresceu no período todo (ex: 150% em 10 anos). CAGR (Compound Annual Growth Rate) é a taxa média anual que geraria o mesmo resultado (ex: 9,6% a.a.). CAGR é melhor para comparar ativos porque normaliza pelo tempo. Um ativo com 100% em 2 anos (41% a.a.) é melhor que 150% em 10 anos (9,6% a.a.), mesmo tendo retorno total menor.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Posso usar o planejamento para aposentadoria?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Sim! Calcule quanto você quer ter aposentado e use isso como meta. Para renda passiva mensal, divida a meta por 150 (regra conservadora: 0,67% a.m. = 8% a.a.). Ex: meta de R$ 1 milhão geraria cerca de R$ 6.600/mês. Se precisa de R$ 5.000/mês, sua meta é aproximadamente R$ 750 mil. Nos últimos 5-10 anos antes da aposentadoria, migre gradualmente para estratégia de segurança.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Como o planejamento considera crises e quedas de mercado?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Nosso planejamento usa dados históricos reais que incluem crises (2008, 2015-2016, 2020). Os ativos recomendados já passaram por períodos difíceis e se recuperaram. Por isso os retornos projetados são realistas, não otimistas. No entanto, crises futuras podem ser diferentes. Mantenha sempre uma reserva de emergência fora dos investimentos e não entre em pânico vendendo em quedas - historicamente, quem manteve investido se recuperou.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Preciso rebalancear a carteira periodicamente?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Sim, mas não com muita frequência. A cada 6-12 meses, verifique se os pesos dos ativos ainda estão próximos do planejado. Se um ativo valorizou muito e agora representa 35% da carteira quando deveria ser 20%, venda um pouco e reforce ativos que ficaram abaixo do peso. Ou simplesmente direcione novos aportes para os ativos que estão abaixo do peso ideal. Evite rebalancear a cada mês - gera custos desnecessários.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Devo incluir imóveis no planejamento patrimonial?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Imóveis físicos são ilíquidos e difíceis de precificar, então nossa calculadora não os inclui. Porém, você pode investir em Fundos Imobiliários (FIIs), que têm liquidez, diversificação e pagam dividendos mensais. FIIs são incluídos nas carteiras recomendadas. Se você já tem imóveis próprios, considere-os como parte do seu patrimônio total e foque os investimentos em ações e FIIs para diversificação.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Quanto da minha renda devo investir mensalmente?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Uma regra comum é 20-30% da renda líquida. Mas depende muito de sua situação: idade, dependentes, custo de vida, dívidas. O mínimo recomendado é 10%. Se você ganha R$ 5.000, investir R$ 500-1.500/mês é razoável. Comece com o que é confortável e aumente gradualmente. O mais importante é a consistência - melhor investir R$ 300/mês todo mês do que R$ 1.000 de forma irregular. Comece agora, mesmo que com pouco.
            </p>
          </details>
        </div>

        <h2 class="text-2xl font-bold">Dicas para Executar Seu Planejamento</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              1. Automatize Seus Aportes
            </h4>
            <p class="text-sm text-gray-300">
              Configure transferências automáticas da sua conta para a corretora. Trate o investimento como uma conta que você DEVE pagar todo mês.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              2. Comece Hoje
            </h4>
            <p class="text-sm text-gray-300">
              Não espere "ter mais dinheiro" ou "estudar mais". Comece com o que você tem e aprenda fazendo. Cada mês que passa é um mês perdido de juros compostos.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              3. Mantenha Reserva de Emergência
            </h4>
            <p class="text-sm text-gray-300">
              Antes de investir pesado, tenha 6 meses de despesas em renda fixa líquida. Isso evita vender investimentos em emergências.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              4. Celebre Marcos
            </h4>
            <p class="text-sm text-gray-300">
              Ao atingir 25%, 50%, 75% da meta, celebre! Isso mantém a motivação para os próximos anos de disciplina.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              5. Eduque-se Continuamente
            </h4>
            <p class="text-sm text-gray-300">
              Leia sobre investimentos, acompanhe notícias econômicas, estude os ativos da sua carteira. Conhecimento reduz ansiedade e melhora decisões.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              6. Ajuste Quando Necessário
            </h4>
            <p class="text-sm text-gray-300">
              Se sua renda aumentar, aumente os aportes. Se sua meta mudar, refaça o planejamento. Flexibilidade é importante, mas mantenha a disciplina.
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Erros Comuns a Evitar</h2>
        <div class="space-y-3">
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 font-semibold text-red-400">❌ Metas Irrealistas</h4>
            <p class="text-sm text-gray-300">
              Querer R$ 1 milhão em 5 anos investindo R$ 500/mês não é viável. Use a calculadora para definir metas realistas baseadas em dados reais.
            </p>
          </div>
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 font-semibold text-red-400">❌ Pular Aportes Mensais</h4>
            <p class="text-sm text-gray-300">
              Inconsistência destrói o planejamento. Se você investe 10 meses e pula 2, perde muito do efeito composto. Seja consistente.
            </p>
          </div>
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 font-semibold text-red-400">❌ Vender em Pânico</h4>
            <p class="text-sm text-gray-300">
              Crises acontecem. Quedas de 20-30% são normais em ações. Vender em pânico cristaliza prejuízos. Mantenha a estratégia de longo prazo.
            </p>
          </div>
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 font-semibold text-red-400">❌ Perseguir "Dicas Quentes"</h4>
            <p class="text-sm text-gray-300">
              Não abandone seu planejamento para investir na "ação da vez". Especulação geralmente resulta em perdas. Siga seu plano.
            </p>
          </div>
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 font-semibold text-red-400">❌ Ignorar Diversificação</h4>
            <p class="text-sm text-gray-300">
              Concentrar tudo em 1-2 ações é extremamente arriscado. Diversifique entre setores e tipos de ativos como recomendado.
            </p>
          </div>
        </div>
      </div>

      <!-- Calculadoras Relacionadas -->
      <div class="flex flex-col gap-4 rounded-[30px] bg-white/5 p-6">
        <h2 class="text-2xl font-bold">Outras Ferramentas</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/juros-compostos"
            class="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-secondary/50"
          >
            <UIcon
              name="i-lucide-trending-up"
              class="text-secondary size-8 shrink-0"
            />
            <div>
              <h3 class="font-semibold">Calculadora de Juros Compostos</h3>
              <p class="text-sm text-gray-400">
                Simule investimentos com taxas fixas
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
                Analise histórico real de ativos da B3
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- CTA -->
      <MoleculesCtaSection
        title="Acompanhe seu progresso na Redentia"
        description="Crie sua conta e monitore sua carteira real, receba alertas personalizados e análises com IA."
        primary-button-text="Criar conta grátis"
        primary-button-link="/auth/register"
        secondary-button-text="Ver mais guias"
        secondary-button-link="/guias"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAssetsService } from '~/services/assets'

const { getAssets } = useAssetsService()
const { data: assetsData, pending: assetsPending } = await useAsyncData(
  'assets-calculator-planejamento',
  () => getAssets()
)

const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'static'
)

const assets = computed(() => assetsData.value ?? [])

usePageSeo({
  title: 'Calculadora de Planejamento Patrimonial: Alcance Suas Metas | Redentia',
  description:
    'Descubra quanto tempo e quanto investir para atingir suas metas financeiras. Receba carteira recomendada baseada em dados históricos reais da B3. Gratuito!',
  path: '/calculadora/planejamento',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Planejamento Patrimonial', path: '/calculadora/planejamento' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Calculadora de Planejamento Patrimonial Redentia',
      applicationCategory: 'FinanceApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      operatingSystem: 'Web',
      description:
        'Calculadora gratuita de planejamento patrimonial com recomendação de carteira baseada em dados históricos reais da B3.',
      featureList: [
        'Cálculo de tempo para atingir metas',
        'Carteira recomendada personalizada',
        'Dados históricos reais da B3',
        'Estratégias de rentabilidade e segurança',
        'Projeção de patrimônio',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'A carteira recomendada é garantida de funcionar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não há garantias no mercado financeiro. A carteira é baseada em performance histórica real, mas o futuro pode ser diferente. Use como ponto de partida e adapte conforme seu perfil de risco.',
          },
        },
        {
          '@type': 'Question',
          name: 'Com que frequência devo revisar meu planejamento?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Revise a cada 6-12 meses, ou quando houver mudanças significativas na renda ou metas. Evite alterações constantes para não prejudicar o crescimento de longo prazo.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quanto da minha renda devo investir mensalmente?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Uma regra comum é 20-30% da renda líquida, com mínimo recomendado de 10%. O mais importante é a consistência - invista um valor que você consiga manter todos os meses.',
          },
        },
      ],
    },
  ],
})

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})
</script>

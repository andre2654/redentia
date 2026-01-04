<template>
  <NuxtLayout :name="layoutName" title="Simulador de Investimento em Ações">
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
        <span class="text-white">Simulador de Ações</span>
      </nav>

      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-chart-line" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">
            Simulador de Investimento em Ações com Dividendos
          </h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Descubra quanto você teria ganho investindo em ações da B3. Análise baseada em dados históricos reais, incluindo reinvestimento de dividendos e simulação com múltiplos ativos.
        </p>
      </div>

      <!-- Simulador -->
      <CalculatorStock :assets="assets" :assets-loading="assetsLoading" />

      <!-- Conteúdo Educacional -->
      <div class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold">Como Funciona o Simulador de Ações</h2>
        <p class="leading-relaxed text-gray-300">
          Nosso simulador usa dados históricos reais da Bolsa de Valores brasileira (B3) para mostrar exatamente quanto você teria ganho (ou perdido) investindo em ações específicas. Diferente de calculadoras genéricas que usam taxas fixas, aqui você vê o resultado real, com todas as oscilações do mercado.
        </p>
        <p class="leading-relaxed text-gray-300">
          O simulador considera preços históricos de fechamento, dividendos pagos, juros sobre capital próprio (JCP) e permite reinvestimento automático de proventos - exatamente como acontece na realidade com muitos investidores.
        </p>

        <h3 class="text-xl font-semibold">Por que Simular Investimentos em Ações?</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Aprender com o Passado
            </h4>
            <p class="text-sm text-gray-300">
              Entenda como diferentes ações se comportaram em crises, recuperações e momentos de euforia. O passado não garante o futuro, mas ensina muito.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Testar Estratégias
            </h4>
            <p class="text-sm text-gray-300">
              Compare diferentes abordagens: aporte único vs aportes mensais, reinvestir dividendos vs sacar, concentrar em poucas ações vs diversificar.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Avaliar Dividendos
            </h4>
            <p class="text-sm text-gray-300">
              Veja o impacto real dos dividendos no retorno total. Muitas vezes, proventos representam 30-50% do ganho total em ações de qualidade.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Comparar Ativos
            </h4>
            <p class="text-sm text-gray-300">
              Simule múltiplos ativos simultaneamente e compare o desempenho. Descubra quais setores e empresas performaram melhor.
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Como Usar o Simulador</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              1
            </div>
            <div>
              <h4 class="font-semibold">Selecione as Ações</h4>
              <p class="text-sm text-gray-300">
                Use a busca para encontrar ações (ex: PETR4, VALE3, ITUB4) ou FIIs que você quer analisar. Você pode adicionar múltiplos ativos para comparação.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              2
            </div>
            <div>
              <h4 class="font-semibold">Defina o Valor Inicial</h4>
              <p class="text-sm text-gray-300">
                Insira quanto você teria investido inicialmente. Se você adicionar múltiplas ações, o valor será dividido igualmente entre elas.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              3
            </div>
            <div>
              <h4 class="font-semibold">Configure Aportes Mensais</h4>
              <p class="text-sm text-gray-300">
                Defina se você faria aportes mensais e de quanto. O simulador comprará ações a cada mês pelos preços reais históricos.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              4
            </div>
            <div>
              <h4 class="font-semibold">Escolha o Período</h4>
              <p class="text-sm text-gray-300">
                Selecione quantos anos você quer simular. Períodos mais longos mostram melhor o poder do tempo no mercado.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              5
            </div>
            <div>
              <h4 class="font-semibold">Reinvestir Dividendos</h4>
              <p class="text-sm text-gray-300">
                Marque esta opção para reinvestir automaticamente todos os dividendos e JCP recebidos. Isso acelera muito o crescimento patrimonial.
              </p>
            </div>
          </div>
        </div>

        <h2 class="text-2xl font-bold">O Poder dos Dividendos</h2>
        <p class="leading-relaxed text-gray-300">
          Dividendos são parcelas do lucro que as empresas distribuem aos acionistas. No Brasil, eles são isentos de imposto de renda para pessoa física, tornando-os ainda mais atrativos.
        </p>

        <h3 class="text-xl font-semibold">Tipos de Proventos</h3>
        <div class="space-y-3">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold text-secondary">Dividendos</h4>
            <p class="text-sm text-gray-300">
              Distribuição de lucro líquido. Isentos de IR. Pagos periodicamente por empresas lucrativas.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold text-secondary">Juros sobre Capital Próprio (JCP)</h4>
            <p class="text-sm text-gray-300">
              Remuneração aos acionistas que a empresa pode deduzir do IR. Tem 15% de IR retido na fonte, mas ainda assim vantajoso.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold text-secondary">Bonificações</h4>
            <p class="text-sm text-gray-300">
              Novas ações distribuídas gratuitamente aos acionistas, geralmente quando a empresa capitaliza reservas.
            </p>
          </div>
        </div>

        <h3 class="text-xl font-semibold">Reinvestimento vs Saque</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-green-500/20 bg-green-500/10 p-5">
            <h4 class="mb-2 font-semibold text-green-400">
              Reinvestindo Dividendos
            </h4>
            <p class="text-sm text-gray-300 mb-3">
              Você compra mais ações com os dividendos recebidos, acelerando o crescimento exponencial.
            </p>
            <div class="rounded-lg bg-white/10 p-3">
              <p class="text-xs text-gray-400">Exemplo: R$ 10.000 em ITUB4 por 10 anos</p>
              <p class="text-sm font-semibold text-white">
                Com reinvestimento: R$ 45.000
              </p>
              <p class="text-xs text-gray-400">Rentabilidade: 350%</p>
            </div>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-white">
              Sacando Dividendos
            </h4>
            <p class="text-sm text-gray-300 mb-3">
              Você usa os dividendos para renda passiva, mas perde o efeito composto.
            </p>
            <div class="rounded-lg bg-white/10 p-3">
              <p class="text-xs text-gray-400">Exemplo: R$ 10.000 em ITUB4 por 10 anos</p>
              <p class="text-sm font-semibold text-white">
                Sem reinvestimento: R$ 28.000
              </p>
              <p class="text-xs text-gray-400">Rentabilidade: 180%</p>
            </div>
          </div>
        </div>
        <p class="text-sm text-gray-400">
          *Valores ilustrativos. Reinvestir dividendos pode praticamente dobrar seu patrimônio no longo prazo!
        </p>

        <h2 class="text-2xl font-bold">Exemplos de Simulações</h2>

        <h3 class="text-xl font-semibold">Exemplo 1: Blue Chips - Petrobras (PETR4)</h3>
        <div class="rounded-xl border border-white/10 bg-white/5 p-5">
          <div class="mb-4">
            <h4 class="font-semibold">Cenário</h4>
            <ul class="text-sm text-gray-300">
              <li>Investimento inicial: R$ 10.000</li>
              <li>Aporte mensal: R$ 500</li>
              <li>Período: 5 anos (2019-2024)</li>
              <li>Dividendos reinvestidos: Sim</li>
            </ul>
          </div>
          <div class="rounded-lg bg-secondary/20 p-4">
            <p class="text-sm font-semibold text-white">
              Resultado aproximado: R$ 55.000 - R$ 65.000
            </p>
            <p class="text-xs text-gray-400">
              Total investido: R$ 40.000 | Ganho: R$ 15.000 - R$ 25.000
            </p>
            <p class="text-xs text-gray-300 mt-2">
              PETR4 teve forte volatilidade mas pagou dividendos generosos, especialmente em 2022-2024.
            </p>
          </div>
        </div>

        <h3 class="text-xl font-semibold">Exemplo 2: Dividendos Consistentes - Itaú (ITUB4)</h3>
        <div class="rounded-xl border border-white/10 bg-white/5 p-5">
          <div class="mb-4">
            <h4 class="font-semibold">Cenário</h4>
            <ul class="text-sm text-gray-300">
              <li>Investimento inicial: R$ 20.000</li>
              <li>Aporte mensal: R$ 1.000</li>
              <li>Período: 10 anos (2014-2024)</li>
              <li>Dividendos reinvestidos: Sim</li>
            </ul>
          </div>
          <div class="rounded-lg bg-secondary/20 p-4">
            <p class="text-sm font-semibold text-white">
              Resultado aproximado: R$ 280.000 - R$ 320.000
            </p>
            <p class="text-xs text-gray-400">
              Total investido: R$ 140.000 | Ganho: R$ 140.000 - R$ 180.000
            </p>
            <p class="text-xs text-gray-300 mt-2">
              ITUB4 é conhecida por pagar dividendos consistentes, com Dividend Yield médio de 4-6% a.a.
            </p>
          </div>
        </div>

        <h3 class="text-xl font-semibold">Exemplo 3: Growth Stock - Magazine Luiza (MGLU3)</h3>
        <div class="rounded-xl border border-white/10 bg-white/5 p-5">
          <div class="mb-4">
            <h4 class="font-semibold">Cenário</h4>
            <ul class="text-sm text-gray-300">
              <li>Investimento inicial: R$ 10.000</li>
              <li>Aporte mensal: R$ 500</li>
              <li>Período: 5 anos (2019-2024)</li>
              <li>Dividendos: Poucos ou nenhum</li>
            </ul>
          </div>
          <div class="rounded-lg bg-red-500/20 p-4">
            <p class="text-sm font-semibold text-white">
              Resultado aproximado: R$ 15.000 - R$ 25.000
            </p>
            <p class="text-xs text-gray-400">
              Total investido: R$ 40.000 | Perda: R$ 15.000 - R$ 25.000
            </p>
            <p class="text-xs text-gray-300 mt-2">
              MGLU3 teve crescimento explosivo até 2020, mas forte queda após pandemia. Exemplo de alta volatilidade.
            </p>
          </div>
        </div>
        <p class="text-sm text-gray-400">
          *Estes são exemplos ilustrativos. Use o simulador para ver resultados precisos com dados reais!
        </p>

        <h2 class="text-2xl font-bold">Diversificação de Carteira</h2>
        <p class="leading-relaxed text-gray-300">
          Uma das maiores vantagens do simulador é poder testar carteiras diversificadas. Ao invés de simular uma única ação, adicione 5-10 ativos diferentes e veja como a diversificação reduz volatilidade.
        </p>

        <h3 class="text-xl font-semibold">Exemplo de Carteira Diversificada</h3>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead class="bg-white/10">
              <tr>
                <th class="border border-white/20 px-4 py-2 text-left">Ticker</th>
                <th class="border border-white/20 px-4 py-2 text-left">Empresa</th>
                <th class="border border-white/20 px-4 py-2 text-left">Setor</th>
                <th class="border border-white/20 px-4 py-2 text-left">Peso</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-white/20 px-4 py-2 font-semibold">ITUB4</td>
                <td class="border border-white/20 px-4 py-2 text-gray-300">Itaú Unibanco</td>
                <td class="border border-white/20 px-4 py-2 text-gray-300">Bancos</td>
                <td class="border border-white/20 px-4 py-2 text-secondary">20%</td>
              </tr>
              <tr class="bg-white/5">
                <td class="border border-white/20 px-4 py-2 font-semibold">VALE3</td>
                <td class="border border-white/20 px-4 py-2 text-gray-300">Vale</td>
                <td class="border border-white/20 px-4 py-2 text-gray-300">Mineração</td>
                <td class="border border-white/20 px-4 py-2 text-secondary">15%</td>
              </tr>
              <tr>
                <td class="border border-white/20 px-4 py-2 font-semibold">WEGE3</td>
                <td class="border border-white/20 px-4 py-2 text-gray-300">WEG</td>
                <td class="border border-white/20 px-4 py-2 text-gray-300">Bens Industriais</td>
                <td class="border border-white/20 px-4 py-2 text-secondary">15%</td>
              </tr>
              <tr class="bg-white/5">
                <td class="border border-white/20 px-4 py-2 font-semibold">PETR4</td>
                <td class="border border-white/20 px-4 py-2 text-gray-300">Petrobras</td>
                <td class="border border-white/20 px-4 py-2 text-gray-300">Petróleo</td>
                <td class="border border-white/20 px-4 py-2 text-secondary">15%</td>
              </tr>
              <tr>
                <td class="border border-white/20 px-4 py-2 font-semibold">BBDC4</td>
                <td class="border border-white/20 px-4 py-2 text-gray-300">Bradesco</td>
                <td class="border border-white/20 px-4 py-2 text-gray-300">Bancos</td>
                <td class="border border-white/20 px-4 py-2 text-secondary">15%</td>
              </tr>
              <tr class="bg-white/5">
                <td class="border border-white/20 px-4 py-2 font-semibold">BBAS3</td>
                <td class="border border-white/20 px-4 py-2 text-gray-300">Banco do Brasil</td>
                <td class="border border-white/20 px-4 py-2 text-gray-300">Bancos</td>
                <td class="border border-white/20 px-4 py-2 text-secondary">10%</td>
              </tr>
              <tr>
                <td class="border border-white/20 px-4 py-2 font-semibold">RENT3</td>
                <td class="border border-white/20 px-4 py-2 text-gray-300">Localiza</td>
                <td class="border border-white/20 px-4 py-2 text-gray-300">Serviços</td>
                <td class="border border-white/20 px-4 py-2 text-secondary">10%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm text-gray-400">
          Esta carteira diversifica entre setores (bancos, mineração, petróleo, industriais) reduzindo risco específico.
        </p>

        <h2 class="text-2xl font-bold">Perguntas Frequentes</h2>
        
        <div class="space-y-4">
          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Os resultados do simulador são precisos?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Sim! Usamos dados históricos reais da B3, incluindo preços de fechamento ajustados, dividendos e JCP pagos. No entanto, lembre-se que rentabilidades passadas não garantem retornos futuros. O simulador serve para análise histórica e aprendizado, não para prever o futuro.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Por que reinvestir dividendos é importante?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Reinvestir dividendos cria um efeito composto poderoso. Você usa os proventos para comprar mais ações, que geram mais dividendos, e assim por diante. Em 20-30 anos, a diferença entre reinvestir ou sacar pode representar 100-200% a mais de patrimônio. Para quem está acumulando riqueza, reinvestir é essencial.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Qual a diferença entre ações ON e PN?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Ações ON (Ordinárias, terminadas em 3) dão direito a voto em assembleias. Ações PN (Preferenciais, terminadas em 4) geralmente não dão voto, mas têm preferência no recebimento de dividendos. Para investidores individuais focados em dividendos, PN costuma ser a escolha (PETR4, ITUB4, VALE3 é exceção - é ON). Para quem quer participar de decisões da empresa ou compra grande volume, ON pode fazer sentido.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Quantas ações devo ter na carteira?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Estudos mostram que 8-15 ações bem diversificadas (setores diferentes) eliminam a maior parte do risco não-sistemático. Menos de 5 ações = risco concentrado demais. Mais de 20 = difícil acompanhar e poucos ganhos adicionais de diversificação. Para iniciantes, começar com 5-8 blue chips de setores diferentes é um bom ponto de partida.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Quando é melhor fazer aporte único vs aportes mensais?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Se você tem um valor grande disponível, estatisticamente investir tudo imediatamente tende a render mais (70% das vezes o mercado sobe no longo prazo). Porém, aportes mensais têm vantagens: reduzem ansiedade, permitem comprar em diferentes momentos de preço (preço médio), facilitam disciplina e permitem começar mesmo sem muito capital. Uma estratégia é investir 50% imediatamente e o resto em aportes mensais.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              O simulador considera custos e impostos?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Atualmente, o simulador não desconta corretagem, custódia ou imposto sobre ganho de capital (15% acima de R$ 20 mil/mês). Dividendos são isentos de IR, mas JCP tem 15% retido na fonte. Para resultados mais precisos, considere que seus ganhos reais serão cerca de 2-5% menores devido a esses custos, especialmente se você fizer muitas operações pequenas.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Devo investir em ações de alto dividendo?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Não necessariamente. Dividend Yield alto pode indicar: 1) Empresa madura pagando bem os acionistas (bom), 2) Preço da ação caiu muito (cuidado!), ou 3) Empresa está distribuindo mais do que deveria. Avalie também o payout (% do lucro distribuído - ideal 40-60%), histórico de pagamentos consistentes, saúde financeira da empresa e potencial de crescimento. Às vezes empresas com DY médio mas crescimento forte são melhores no longo prazo.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Ações ou FIIs: qual é melhor para dividendos?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Depende do objetivo. FIIs geralmente pagam dividendos mensais e maiores (DY de 8-12%), mas têm menor potencial de valorização. Ações pagam menos em dividendos (DY de 3-8%) mas podem valorizar mais no longo prazo. O ideal é ter ambos: FIIs para renda passiva mensal estável, ações para crescimento de capital e proteção contra inflação. Uma carteira balanceada pode ter 40-60% ações e 40-60% FIIs, dependendo do perfil.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Como escolher boas ações para investir?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Analise: 1) Fundamentos: lucro consistente, baixo endividamento, boa geração de caixa, 2) Dividendos: histórico de pagamentos, payout sustentável, 3) Setor: preferir setores defensivos ou com boas perspectivas, 4) Preço: não pagar caro (P/L, P/VP razoáveis), 5) Gestão: empresa bem administrada, 6) Vantagem competitiva: diferenciação, marca forte. Use o simulador para ver como a ação performou no passado e ler análises na Redentia.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Qual o melhor período para simular?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Teste diferentes períodos! 5 anos mostra ciclos recentes. 10 anos inclui crises e recuperações. 15-20 anos mostra o verdadeiro poder do longo prazo, mas nem todas as ações têm histórico tão longo. Períodos que incluem crises (2008, 2015-2016, 2020) são especialmente educativos para entender volatilidade e recuperação. O importante é pensar sempre no longo prazo - ações são investimentos de 10+ anos.
            </p>
          </details>
        </div>

        <h2 class="text-2xl font-bold">Dicas para Investir em Ações</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              1. Invista no Longo Prazo
            </h4>
            <p class="text-sm text-gray-300">
              Ações são voláteis no curto prazo, mas historicamente rentáveis em 10+ anos. Não invista dinheiro que você vai precisar em menos de 5 anos.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              2. Diversifique Sempre
            </h4>
            <p class="text-sm text-gray-300">
              Nunca coloque todos os ovos na mesma cesta. Diversifique entre setores e tipos de ações. Use o simulador para testar diferentes combinações.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              3. Reinvista os Dividendos
            </h4>
            <p class="text-sm text-gray-300">
              Principalmente na fase de acumulação. O efeito composto dos dividendos pode dobrar seu patrimônio ao longo de 20-30 anos.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              4. Estude as Empresas
            </h4>
            <p class="text-sm text-gray-300">
              Não compre ações só porque alguém recomendou. Entenda o negócio, analise fundamentos e use o simulador para ver o histórico.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              5. Mantenha Aportes Regulares
            </h4>
            <p class="text-sm text-gray-300">
              Invista mensalmente, independente do momento do mercado. Isso reduz risco de timing e constrói disciplina.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              6. Não Se Desespere em Crises
            </h4>
            <p class="text-sm text-gray-300">
              Quedas fazem parte. Historicamente, quem manteve investido em crises saiu ganhando. Use quedas para comprar mais barato.
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
            to="/calculadora/planejamento"
            class="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-secondary/50"
          >
            <UIcon
              name="i-lucide-target"
              class="text-secondary size-8 shrink-0"
            />
            <div>
              <h3 class="font-semibold">Planejamento Patrimonial</h3>
              <p class="text-sm text-gray-400">
                Crie estratégia para suas metas
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- CTA -->
      <MoleculesCtaSection
        title="Descubra as melhores ações para investir"
        description="Use a Redentia para analisar ações em tempo real, receber recomendações com IA e acompanhar sua carteira."
        primary-button-text="Criar conta grátis"
        primary-button-link="/auth/register"
        secondary-button-text="Ver ações em alta"
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
  'assets-calculator-acoes',
  () => getAssets()
)

const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'static'
)

const assets = computed(() => assetsData.value ?? [])
const assetsLoading = computed(() => assetsPending.value)

usePageSeo({
  title: 'Simulador de Investimento em Ações com Dividendos | Redentia',
  description:
    'Simule quanto você teria ganho investindo em ações da B3. Análise com dados históricos reais, reinvestimento de dividendos e comparação de múltiplos ativos. Gratuito!',
  path: '/calculadora/acoes',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Simulador de Ações', path: '/calculadora/acoes' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Simulador de Investimento em Ações Redentia',
      applicationCategory: 'FinanceApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      operatingSystem: 'Web',
      description:
        'Simulador gratuito de investimento em ações com dados históricos reais da B3, incluindo dividendos e proventos.',
      featureList: [
        'Dados históricos reais da B3',
        'Reinvestimento de dividendos',
        'Simulação com múltiplos ativos',
        'Gráficos de evolução',
        'Histórico de proventos detalhado',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Os resultados do simulador são precisos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim! Usamos dados históricos reais da B3, incluindo preços de fechamento ajustados, dividendos e JCP pagos. No entanto, rentabilidades passadas não garantem retornos futuros.',
          },
        },
        {
          '@type': 'Question',
          name: 'Por que reinvestir dividendos é importante?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Reinvestir dividendos cria um efeito composto poderoso. Em 20-30 anos, a diferença entre reinvestir ou sacar pode representar 100-200% a mais de patrimônio.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quantas ações devo ter na carteira?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Estudos mostram que 8-15 ações bem diversificadas eliminam a maior parte do risco. Para iniciantes, começar com 5-8 blue chips de setores diferentes é um bom ponto de partida.',
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

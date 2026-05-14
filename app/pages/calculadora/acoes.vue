<template>
  <NuxtLayout name="default" title="Simulador de Investimento em Ações">
    <CalculatorStock
      :assets="assets"
      :assets-loading="assetsLoading"
      back-to="/calculadora"
      back-label="Todas as calculadoras"
      :last-updated="lastUpdatedText"
    >
      <template #hero>
        <p class="calc-eyebrow">Simulador · Investimento em Ações</p>
        <h1 class="calc-title">
          Histórico real da B3 com
          <em class="calc-italic">Dividendos.</em>
        </h1>
        <p class="calc-lead">
          Este simulador mostra quanto você teria ganhado investindo em qualquer ação da B3 usando <strong>dados históricos reais</strong>, incluindo dividendos e JCP reinvestidos. Escolhe ticker(s), valor inicial, aporte mensal e período. Exemplo: R$ 10.000 + R$ 500/mês em ITUB4 nos últimos 10 anos, com dividendos reinvestidos, viraria R$ 280.000-320.000.
        </p>
        <ul class="calc-chips">
          <li><span class="dot positive" /> 100% gratuito</li>
          <li><span class="dot" /> Cálculo instantâneo</li>
          <li><span class="dot" /> Dados reais da B3</li>
          <li><span class="dot" /> Dividendos e JCP reinvestidos</li>
        </ul>
      </template>
    </CalculatorStock>

    <section class="calc-aux flex flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8">

      <!-- Cenarios populares (internal linking + deep-links) -->
      <!--
        Cada link e uma "landing page virtual" que o Google indexa
        independente. Stock.vue le `?initial=`, `?monthly=`, `?years=`,
        `?reinvest=`, `?tickers=` e ja dispara o calculo no mount.
        Foco em long-tails reais ("ITUB4 dividendos 10 anos",
        "carteira blue chips 5 anos", "PETR4 vs VALE3", etc).
      -->
      <div
        class="flex flex-col gap-3 rounded-lg border p-4 sm:p-6"
        :style="{
          backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
          borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
        }"
      >
        <h2>Cenários populares de simulação</h2>
        <p class="text-sm">
          Veja na hora o histórico real dos cenários mais buscados, basta clicar e a simulação carrega já preenchida com tickers, aporte e período.
        </p>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <NuxtLink
            v-for="s in popularScenarios"
            :key="s.label"
            :to="s.to"
            class="group flex min-h-[44px] items-center gap-3 rounded-md border px-3 py-3 transition hover:border-secondary/40 hover:bg-secondary/10 sm:flex-col sm:items-start sm:gap-0.5 sm:rounded-xl"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <span class="flex items-center gap-1.5 text-sm font-medium">
              <UIcon :name="s.icon" class="size-4 text-secondary" />
              {{ s.label }}
            </span>
            <span class="text-[11px] line-clamp-1" :style="{ color: 'var(--brand-text-muted)' }">{{ s.sub }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Conteúdo Educacional -->
      <div class="quiet-prose calc-edu-prose max-w-none" :style="{ color: 'var(--brand-text)' }">
        <h2>Calculadora de Investimento em Ações Online</h2>
        <h2>Como Funciona o Simulador de Ações</h2>
        <p class="leading-relaxed">
          Nosso simulador usa dados históricos reais da Bolsa de Valores brasileira (B3) para mostrar exatamente quanto você teria ganho (ou perdido) investindo em ações específicas. Diferente de calculadoras genéricas que usam taxas fixas, aqui você vê o resultado real, com todas as oscilações do mercado.
        </p>
        <p class="leading-relaxed">
          O simulador considera preços históricos de fechamento, dividendos pagos, juros sobre capital próprio (JCP) e permite reinvestimento automático de proventos - exatamente como acontece na realidade com muitos investidores.
        </p>

        <h3>Por que Simular Investimentos em Ações?</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-2 text-secondary">
              Aprender com o Passado
            </h4>
            <p class="text-sm">
              Entenda como diferentes ações se comportaram em crises, recuperações e momentos de euforia. O passado não garante o futuro, mas ensina muito.
            </p>
          </div>
          <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-2 text-secondary">
              Testar Estratégias
            </h4>
            <p class="text-sm">
              Compare diferentes abordagens: aporte único vs aportes mensais, reinvestir dividendos vs sacar, concentrar em poucas ações vs diversificar.
            </p>
          </div>
          <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-2 text-secondary">
              Avaliar Dividendos
            </h4>
            <p class="text-sm">
              Veja o impacto real dos dividendos no retorno total. Muitas vezes, proventos representam 30-50% do ganho total em ações de qualidade.
            </p>
          </div>
          <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-2 text-secondary">
              Comparar Ativos
            </h4>
            <p class="text-sm">
              Simule múltiplos ativos simultaneamente e compare o desempenho. Descubra quais setores e empresas performaram melhor.
            </p>
          </div>
        </div>

        <h2>Como Usar o Simulador</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              1
            </div>
            <div>
              <h4>Selecione as Ações</h4>
              <p class="text-sm">
                Use a busca para encontrar ações (ex: PETR4, VALE3, ITUB4) ou FIIs que você quer analisar. Você pode adicionar múltiplos ativos para comparação.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              2
            </div>
            <div>
              <h4>Defina o Valor Inicial</h4>
              <p class="text-sm">
                Insira quanto você teria investido inicialmente. Se você adicionar múltiplas ações, o valor será dividido igualmente entre elas.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              3
            </div>
            <div>
              <h4>Configure Aportes Mensais</h4>
              <p class="text-sm">
                Defina se você faria aportes mensais e de quanto. O simulador comprará ações a cada mês pelos preços reais históricos.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              4
            </div>
            <div>
              <h4>Escolha o Período</h4>
              <p class="text-sm">
                Selecione quantos anos você quer simular. Períodos mais longos mostram melhor o poder do tempo no mercado.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              5
            </div>
            <div>
              <h4>Reinvestir Dividendos</h4>
              <p class="text-sm">
                Marque esta opção para reinvestir automaticamente todos os dividendos e JCP recebidos. Isso acelera muito o crescimento patrimonial.
              </p>
            </div>
          </div>
        </div>

        <h2>O Poder dos Dividendos</h2>
        <p class="leading-relaxed">
          Dividendos são parcelas do lucro que as empresas distribuem aos acionistas. No Brasil, eles são isentos de imposto de renda para pessoa física, tornando-os ainda mais atrativos.
        </p>

        <h3>Tipos de Proventos</h3>
        <div class="space-y-3">
          <div class="brand-card border p-4" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-1 text-secondary">Dividendos</h4>
            <p class="text-sm">
              Distribuição de lucro líquido. Isentos de IR. Pagos periodicamente por empresas lucrativas.
            </p>
          </div>
          <div class="brand-card border p-4" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-1 text-secondary">Juros sobre Capital Próprio (JCP)</h4>
            <p class="text-sm">
              Remuneração aos acionistas que a empresa pode deduzir do IR. Tem 15% de IR retido na fonte, mas ainda assim vantajoso.
            </p>
          </div>
          <div class="brand-card border p-4" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-1 text-secondary">Bonificações</h4>
            <p class="text-sm">
              Novas ações distribuídas gratuitamente aos acionistas, geralmente quando a empresa capitaliza reservas.
            </p>
          </div>
        </div>

        <h3>Reinvestimento vs Saque</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              borderColor: `color-mix(in srgb, var(--brand-positive) 20%, transparent)`,
              backgroundColor: `color-mix(in srgb, var(--brand-positive) 5%, transparent)`,
            }"
          >
            <h4 class="mb-2" :style="{ color: 'var(--brand-positive)' }">
              Reinvestindo Dividendos
            </h4>
            <p class="text-sm mb-3">
              Você compra mais ações com os dividendos recebidos, acelerando o crescimento exponencial.
            </p>
            <div class="rounded-lg p-3" :style="{ backgroundColor: 'var(--brand-border)' }">
              <p class="text-xs opacity-60">Exemplo: R$ 10.000 em ITUB4 por 10 anos</p>
              <p class="text-sm">
                Com reinvestimento: R$ 45.000
              </p>
              <p class="text-xs opacity-60">Rentabilidade: 350%</p>
            </div>
          </div>
          <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-2">
              Sacando Dividendos
            </h4>
            <p class="text-sm mb-3">
              Você usa os dividendos para renda passiva, mas perde o efeito composto.
            </p>
            <div class="rounded-lg p-3" :style="{ backgroundColor: 'var(--brand-border)' }">
              <p class="text-xs opacity-60">Exemplo: R$ 10.000 em ITUB4 por 10 anos</p>
              <p class="text-sm">
                Sem reinvestimento: R$ 28.000
              </p>
              <p class="text-xs opacity-60">Rentabilidade: 180%</p>
            </div>
          </div>
        </div>
        <p class="text-sm opacity-60">
          *Valores ilustrativos. Reinvestir dividendos pode praticamente dobrar seu patrimônio no longo prazo!
        </p>

        <p class="leading-relaxed">
          Compare sempre com o Ibovespa: o índice reúne ~80 ações mais negociadas da B3 e serve como benchmark do mercado brasileiro. Histórico ~14% a.a. nos últimos 30 anos. Ações que rendem MENOS que o Ibovespa por longos períodos sinalizam underperformance, considere rebalancear.
        </p>

        <h2>Exemplos de Simulações</h2>

        <h3>Exemplo 1: Blue Chips - Petrobras (PETR4)</h3>
        <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
          <div class="mb-4">
            <h4>Cenário</h4>
            <ul class="text-sm">
              <li>Investimento inicial: R$ 10.000</li>
              <li>Aporte mensal: R$ 500</li>
              <li>Período: 5 anos (2019-2024)</li>
              <li>Dividendos reinvestidos: Sim</li>
            </ul>
          </div>
          <div class="rounded-lg bg-secondary/20 p-4">
            <p class="text-sm">
              Resultado aproximado: R$ 55.000 - R$ 65.000
            </p>
            <p class="text-xs opacity-60">
              Total investido: R$ 40.000 | Ganho: R$ 15.000 - R$ 25.000
            </p>
            <p class="text-xs mt-2">
              PETR4 teve forte volatilidade mas pagou dividendos generosos, especialmente em 2022-2024.
            </p>
          </div>
        </div>

        <h3>Exemplo 2: Dividendos Consistentes - Itaú (ITUB4)</h3>
        <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
          <div class="mb-4">
            <h4>Cenário</h4>
            <ul class="text-sm">
              <li>Investimento inicial: R$ 20.000</li>
              <li>Aporte mensal: R$ 1.000</li>
              <li>Período: 10 anos (2014-2024)</li>
              <li>Dividendos reinvestidos: Sim</li>
            </ul>
          </div>
          <div class="rounded-lg bg-secondary/20 p-4">
            <p class="text-sm">
              Resultado aproximado: R$ 280.000 - R$ 320.000
            </p>
            <p class="text-xs opacity-60">
              Total investido: R$ 140.000 | Ganho: R$ 140.000 - R$ 180.000
            </p>
            <p class="text-xs mt-2">
              ITUB4 é conhecida por pagar dividendos consistentes, com Dividend Yield médio de 4-6% a.a.
            </p>
          </div>
        </div>

        <h3>Exemplo 3: Growth Stock - Magazine Luiza (MGLU3)</h3>
        <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
          <div class="mb-4">
            <h4>Cenário</h4>
            <ul class="text-sm">
              <li>Investimento inicial: R$ 10.000</li>
              <li>Aporte mensal: R$ 500</li>
              <li>Período: 5 anos (2019-2024)</li>
              <li>Dividendos: Poucos ou nenhum</li>
            </ul>
          </div>
          <div
            class="rounded-lg p-4"
            :style="{ backgroundColor: `color-mix(in srgb, var(--brand-negative) 20%, transparent)` }"
          >
            <p class="text-sm">
              Resultado aproximado: R$ 15.000 - R$ 25.000
            </p>
            <p class="text-xs opacity-60">
              Total investido: R$ 40.000 | Perda: R$ 15.000 - R$ 25.000
            </p>
            <p class="text-xs mt-2">
              MGLU3 teve crescimento explosivo até 2020, mas forte queda após pandemia. Exemplo de alta volatilidade.
            </p>
          </div>
        </div>
        <h3>Exemplo 4: Banco do Brasil (BBAS3), banco estatal com DY 8-12%</h3>
        <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
          <div class="mb-4">
            <h4>Cenário</h4>
            <ul class="text-sm">
              <li>Investimento inicial: R$ 10.000</li>
              <li>Aporte mensal: R$ 500</li>
              <li>Período: 10 anos</li>
              <li>Dividendos reinvestidos: Sim</li>
            </ul>
          </div>
          <div class="rounded-lg bg-secondary/20 p-4">
            <p class="text-sm">
              Resultado aproximado: R$ 90.000 - R$ 120.000
            </p>
            <p class="text-xs opacity-60">
              Total investido: R$ 70.000 | Ganho: R$ 20.000 - R$ 50.000
            </p>
            <p class="text-xs mt-2">
              BBAS3 é dos maiores pagadores de dividendos da B3, com DY de 8-12% em vários anos. Sensível a ciclo político, mas balanço sólido.
            </p>
          </div>
        </div>

        <h3>Exemplo 5: Ambev (ABEV3), defensiva com dividendos previsíveis</h3>
        <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
          <div class="mb-4">
            <h4>Cenário</h4>
            <ul class="text-sm">
              <li>Investimento inicial: R$ 10.000</li>
              <li>Aporte mensal: R$ 500</li>
              <li>Período: 10 anos</li>
              <li>Dividendos reinvestidos: Sim</li>
            </ul>
          </div>
          <div class="rounded-lg bg-secondary/20 p-4">
            <p class="text-sm">
              Resultado aproximado: R$ 65.000 - R$ 85.000
            </p>
            <p class="text-xs opacity-60">
              Total investido: R$ 70.000 | Ganho: até R$ 15.000
            </p>
            <p class="text-xs mt-2">
              ABEV3 é uma defensiva clássica: DY menor (3-5%) mas previsível, baixa volatilidade. Não brilha em ciclos de bolsa em alta, mas segura bem em crises.
            </p>
          </div>
        </div>
        <p class="text-sm opacity-60">
          *Estes são exemplos ilustrativos. Use o simulador para ver resultados precisos com dados reais!
        </p>

        <h2>Comparativo: PETR4 vs VALE3 (10 anos)</h2>
        <p class="leading-relaxed">
          PETR4 e VALE3 são os dois pesos-pesados de commodities da B3 e disputam o topo do ranking de pagadoras de dividendos. Ver lado a lado ajuda a entender o trade-off entre as duas teses:
        </p>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-2 text-secondary">PETR4, Petrobras</h4>
            <p class="text-sm">
              Setor de óleo e gás. Pagou dividendos extraordinários em 2022-2024 (Dividend Yield de 30%+ em alguns anos). Forte volatilidade, sensível a preço do petróleo, câmbio e política de preços. Histórico 10 anos: ~150% de retorno bruto + dividendos.
            </p>
          </div>
          <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-2 text-secondary">VALE3, Vale</h4>
            <p class="text-sm">
              Setor de mineração de ferro. Dividendos sazonais conforme o preço da commodity, exporta majoritariamente pra China. Volátil. Histórico 10 anos: ~120% de retorno bruto + dividendos.
            </p>
          </div>
        </div>
        <p class="leading-relaxed">
          Conclusão: ambas têm forte exposição a commodities. Ter VALE3 + PETR4 não dilui muito o risco setorial, as duas reagem juntas a ciclos globais. Pra balancear, combine com bancos (ITUB4, BBAS3) e bens industriais (WEGE3), que têm dinâmicas mais descorrelacionadas e dão mais previsibilidade ao portfólio.
        </p>

        <h2>Diversificação de Carteira</h2>
        <p class="leading-relaxed">
          Uma das maiores vantagens do simulador é poder testar carteiras diversificadas. Ao invés de simular uma única ação, adicione 5-10 ativos diferentes e veja como a diversificação reduz volatilidade.
        </p>

        <h3>Exemplo de Carteira Diversificada</h3>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead :style="{ backgroundColor: 'var(--brand-surface)' }">
              <tr>
                <th class="border px-4 py-2 text-left">Ticker</th>
                <th class="border px-4 py-2 text-left">Empresa</th>
                <th class="border px-4 py-2 text-left">Setor</th>
                <th class="border px-4 py-2 text-left">Peso</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border px-4 py-2">ITUB4</td>
                <td class="border px-4 py-2 opacity-80">Itaú Unibanco</td>
                <td class="border px-4 py-2 opacity-80">Bancos</td>
                <td class="border px-4 py-2 text-secondary">20%</td>
              </tr>
              <tr :style="{ backgroundColor: 'var(--brand-surface)' }">
                <td class="border px-4 py-2">VALE3</td>
                <td class="border px-4 py-2 opacity-80">Vale</td>
                <td class="border px-4 py-2 opacity-80">Mineração</td>
                <td class="border px-4 py-2 text-secondary">15%</td>
              </tr>
              <tr>
                <td class="border px-4 py-2">WEGE3</td>
                <td class="border px-4 py-2 opacity-80">WEG</td>
                <td class="border px-4 py-2 opacity-80">Bens Industriais</td>
                <td class="border px-4 py-2 text-secondary">15%</td>
              </tr>
              <tr :style="{ backgroundColor: 'var(--brand-surface)' }">
                <td class="border px-4 py-2">PETR4</td>
                <td class="border px-4 py-2 opacity-80">Petrobras</td>
                <td class="border px-4 py-2 opacity-80">Petróleo</td>
                <td class="border px-4 py-2 text-secondary">15%</td>
              </tr>
              <tr>
                <td class="border px-4 py-2">BBDC4</td>
                <td class="border px-4 py-2 opacity-80">Bradesco</td>
                <td class="border px-4 py-2 opacity-80">Bancos</td>
                <td class="border px-4 py-2 text-secondary">15%</td>
              </tr>
              <tr :style="{ backgroundColor: 'var(--brand-surface)' }">
                <td class="border px-4 py-2">BBAS3</td>
                <td class="border px-4 py-2 opacity-80">Banco do Brasil</td>
                <td class="border px-4 py-2 opacity-80">Bancos</td>
                <td class="border px-4 py-2 text-secondary">10%</td>
              </tr>
              <tr>
                <td class="border px-4 py-2">RENT3</td>
                <td class="border px-4 py-2 opacity-80">Localiza</td>
                <td class="border px-4 py-2 opacity-80">Serviços</td>
                <td class="border px-4 py-2 text-secondary">10%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm opacity-60">
          Esta carteira diversifica entre setores (bancos, mineração, petróleo, industriais) reduzindo risco específico.
        </p>

        <MoleculesFAQ
          title="Perguntas Frequentes"
          :items="faqItems"
        />

        <h2>Estratégia Buy and Hold: Comprar e Manter</h2>
        <p class="leading-relaxed">
          Buy and Hold significa "comprar e manter": adquirir ações de empresas sólidas e segurar por décadas, ignorando oscilações de curto prazo. É a estratégia defendida por Warren Buffett e Charlie Munger, e historicamente entrega retornos próximos do índice de referência sem o stress de tentar acertar timing.
        </p>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-2 text-secondary">Vantagens</h4>
            <p class="text-sm">
              Zero stress de timing de mercado. Aproveita a isenção de IR de R$ 20 mil/mês em vendas pequenas. Dividendos compostos crescem ano a ano. Custos de corretagem mínimos por baixo giro.
            </p>
          </div>
          <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-2 text-secondary">Desvantagens</h4>
            <p class="text-sm">
              Precisa estômago pra crises (-30%, -50% acontecem em ciclos). Empresas que pareciam sólidas podem deteriorar (Eternit, OGX, Eletrobras). Não funciona pra dinheiro de curto prazo.
            </p>
          </div>
        </div>
        <p class="leading-relaxed">
          Como aplicar na prática: monte uma carteira com 5-10 ações de qualidade (blue chips ITUB4, ITSA4, BBAS3, BBSE3, WEGE3, ABEV3 são clássicas), mantenha aporte mensal automático, NÃO venda em crises (cristaliza prejuízo), e rebalanceie 1x por ano pra manter os pesos próximos do plano.
        </p>

        <h2>Dicas para Investir em Ações</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-2 text-secondary">
              1. Invista no Longo Prazo
            </h4>
            <p class="text-sm">
              Ações são voláteis no curto prazo, mas historicamente rentáveis em 10+ anos. Não invista dinheiro que você vai precisar em menos de 5 anos.
            </p>
          </div>
          <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-2 text-secondary">
              2. Diversifique Sempre
            </h4>
            <p class="text-sm">
              Nunca coloque todos os ovos na mesma cesta. Diversifique entre setores e tipos de ações. Use o simulador para testar diferentes combinações.
            </p>
          </div>
          <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-2 text-secondary">
              3. Reinvista os Dividendos
            </h4>
            <p class="text-sm">
              Principalmente na fase de acumulação. O efeito composto dos dividendos pode dobrar seu patrimônio ao longo de 20-30 anos.
            </p>
          </div>
          <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-2 text-secondary">
              4. Estude as Empresas
            </h4>
            <p class="text-sm">
              Não compre ações só porque alguém recomendou. Entenda o negócio, analise fundamentos e use o simulador para ver o histórico.
            </p>
          </div>
          <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-2 text-secondary">
              5. Mantenha Aportes Regulares
            </h4>
            <p class="text-sm">
              Invista mensalmente, independente do momento do mercado. Isso reduz risco de timing e constrói disciplina.
            </p>
          </div>
          <div class="brand-card border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <h4 class="mb-2 text-secondary">
              6. Não Se Desespere em Crises
            </h4>
            <p class="text-sm">
              Quedas fazem parte. Historicamente, quem manteve investido em crises saiu ganhando. Use quedas para comprar mais barato.
            </p>
          </div>
        </div>
      </div>

      <!-- Rankings Relacionados -->
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
      <div class="flex flex-col gap-4 rounded-lg p-6" :style="{ backgroundColor: 'var(--brand-surface)' }">
        <h2>Outras Ferramentas</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/juros-compostos"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }"
          >
            <UIcon
              name="i-lucide-trending-up"
              class="text-secondary size-8 shrink-0"
            />
            <div>
              <h3>Calculadora de Juros Compostos</h3>
              <p class="text-sm opacity-60">
                Simule investimentos com taxas fixas
              </p>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/calculadora/planejamento"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }"
          >
            <UIcon
              name="i-lucide-target"
              class="text-secondary size-8 shrink-0"
            />
            <div>
              <h3>Planejamento Patrimonial</h3>
              <p class="text-sm opacity-60">
                Crie estratégia para suas metas
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- CTA -->
      <MoleculesCtaSection
        title="Descubra as melhores ações para investir"
        :description="`Use a ${brand.name} para analisar ações em tempo real, receber recomendações com IA e acompanhar sua carteira.`"
        :buttons="[
          { label: 'Criar conta grátis', to: '/auth/register', icon: 'i-lucide-arrow-right', variant: 'primary' },
          { label: 'Ver ações em alta', to: '/acoes', variant: 'outline' },
        ]"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAssetsService } from '~/services/assets'

const brand = useBrand()
const { getAssets } = useAssetsService()
const { data: assetsData, pending: assetsPending } = await useAsyncData(
  'assets-calculator-acoes',
  () => getAssets()
)

const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)

// Rankings relacionados — pontes pra movimentacao recente (alta 30d e
// 12m) e maiores receitas, complementares ao simulador de acoes.
const relatedRankings = [
  {
    to: '/ranking/maiores-altas-mes',
    icon: 'i-lucide-trending-up',
    title: 'Maiores altas do mês',
    sub: 'Top performers nos últimos 30 dias',
  },
  {
    to: '/ranking/maiores-altas-12-meses',
    icon: 'i-lucide-arrow-up-right',
    title: 'Maiores altas de 12 meses',
    sub: 'Quem mais valorizou no último ano',
  },
  {
    to: '/ranking/maiores-receitas',
    icon: 'i-lucide-banknote',
    title: 'Maiores receitas',
    sub: 'Top empresas por faturamento TTM',
  },
] as const

const assets = computed(() => assetsData.value ?? [])
const assetsLoading = computed(() => assetsPending.value)

// Data de atualizacao dinamica, Google usa dateModified como sinal
// de frescor; bumpar CONTENT_VERSION ao mudar a calculadora ou
// conteudo educacional dispara o re-crawl mais cedo.
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const lastUpdatedISO = lastUpdated.toISOString().slice(0, 10)

// ====================================================================
// Cenarios populares, long-tail SEO via deep-links.
// Cada cenario combina ticker(s)+aporte+periodo em uma URL canonica
// que o Stock.vue ja le no mount (via parseTickersParam) e dispara o
// calculo automaticamente. Mantenha alinhado com queries reais do GSC
// ("ITUB4 dividendos 10 anos", "carteira blue chips 5 anos",
// "PETR4 historico 5 anos", "WEGE3 10 anos", etc).
//
// Tickers em comma-separated (?tickers=ITUB4,VALE3,PETR4) sao
// resolvidos pelo watcher de props.assets do Stock.vue.
// ====================================================================
const popularScenarios = [
  { label: 'ITUB4 + dividendos 10 anos', sub: 'R$ 10k inicial + R$ 500/mês', icon: 'i-lucide-landmark', to: '/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=ITUB4' },
  { label: 'Carteira blue chips 5 anos', sub: 'ITUB4, VALE3, PETR4', icon: 'i-lucide-trophy', to: '/calculadora/acoes?initial=15000&monthly=900&years=5&reinvest=1&tickers=ITUB4,VALE3,PETR4' },
  { label: 'PETR4 puro 5 anos', sub: 'Petrobras com dividendos', icon: 'i-lucide-fuel', to: '/calculadora/acoes?initial=10000&monthly=500&years=5&reinvest=1&tickers=PETR4' },
  { label: 'VALE3, 10 anos com dividendos', sub: 'Mineração na carteira', icon: 'i-lucide-mountain', to: '/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=VALE3' },
  { label: 'Carteira FIIs (HGLG11, KNCR11)', sub: 'Renda passiva mensal', icon: 'i-lucide-building-2', to: '/calculadora/acoes?initial=10000&monthly=600&years=5&reinvest=1&tickers=HGLG11,KNCR11' },
  { label: 'BBDC4, banco com dividendos', sub: 'Bradesco 10 anos', icon: 'i-lucide-banknote', to: '/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=BBDC4' },
  { label: 'Carteira diversificada 20% cada', sub: 'ITUB4, VALE3, PETR4, WEGE3, BBDC4', icon: 'i-lucide-pie-chart', to: '/calculadora/acoes?initial=20000&monthly=1000&years=10&reinvest=1&tickers=ITUB4,VALE3,PETR4,WEGE3,BBDC4' },
  { label: 'Top dividendos 10 anos', sub: 'TAEE11 + BBSE3', icon: 'i-lucide-coins', to: '/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=TAEE11,BBSE3' },
  { label: 'MGLU3 vs ITUB4', sub: 'Growth vs value 5 anos', icon: 'i-lucide-bar-chart-3', to: '/calculadora/acoes?initial=10000&monthly=500&years=5&reinvest=1&tickers=MGLU3,ITUB4' },
  { label: 'WEGE3 puro, 10 anos', sub: 'Indústria com forte crescimento', icon: 'i-lucide-cog', to: '/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=WEGE3' },
  { label: 'Tesouro vs Bolsa', sub: 'R$ 500/mês comparativo', icon: 'i-lucide-scale', to: '/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=BOVA11' },
  { label: 'Carteira small caps', sub: 'Setor de crescimento agressivo', icon: 'i-lucide-rocket', to: '/calculadora/acoes?initial=10000&monthly=600&years=5&reinvest=1&tickers=SMAL11' },
  { label: 'BBAS3, banco estatal 10 anos', sub: 'Banco do Brasil DY 8-12%', icon: 'i-lucide-landmark', to: '/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=BBAS3' },
  { label: 'ABEV3 defensiva 10 anos', sub: 'Ambev, dividendos previsíveis', icon: 'i-lucide-beer', to: '/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=ABEV3' },
] as const

// FAQs duplicados aqui pra manter a fonte unica entre o HTML
// (renderizado nos `<details>`) e o FAQPage schema (mainEntity).
// Antes o schema tinha so 3 perguntas e o HTML 10, Google ignora
// FAQs nao espelhados, perdendo rich snippet em 7 perguntas. Agora
// um array so popula os dois lados.
const faqItems = [
  {
    question: 'Os resultados do simulador são precisos?',
    answer: 'Sim. Usamos dados históricos reais da B3, incluindo preços de fechamento ajustados, dividendos e JCP pagos. Lembre-se que rentabilidades passadas não garantem retornos futuros. O simulador serve para análise histórica e aprendizado, não para prever o futuro.',
  },
  {
    question: 'Por que reinvestir dividendos é importante?',
    answer: 'Reinvestir dividendos cria um efeito composto poderoso. Você usa os proventos para comprar mais ações, que geram mais dividendos, e assim por diante. Em 20-30 anos, a diferença entre reinvestir ou sacar pode representar 100-200% a mais de patrimônio. Para quem está acumulando riqueza, reinvestir é essencial.',
  },
  {
    question: 'Qual a diferença entre ações ON e PN?',
    answer: 'Ações ON (Ordinárias, terminadas em 3) dão direito a voto em assembleias. Ações PN (Preferenciais, terminadas em 4) geralmente não dão voto, mas têm preferência no recebimento de dividendos. Para investidores individuais focados em dividendos, PN costuma ser a escolha. ITUB4 é PN, PETR4 é PN, VALE3 é exceção (ON). Para quem quer participar de decisões da empresa ou compra grande volume, ON pode fazer sentido.',
  },
  {
    question: 'Quantas ações devo ter na carteira?',
    answer: 'Estudos mostram que 8-15 ações bem diversificadas (setores diferentes) eliminam a maior parte do risco não-sistemático. Menos de 5 ações = risco concentrado demais. Mais de 20 = difícil acompanhar e poucos ganhos adicionais de diversificação. Para iniciantes, começar com 5-8 blue chips de setores diferentes é um bom ponto de partida.',
  },
  {
    question: 'Quando é melhor fazer aporte único vs aportes mensais?',
    answer: 'Se você tem um valor grande disponível, estatisticamente investir tudo imediatamente tende a render mais (70% das vezes o mercado sobe no longo prazo). Aportes mensais reduzem ansiedade, permitem comprar em diferentes momentos de preço (preço médio), facilitam disciplina e permitem começar mesmo sem muito capital. Uma estratégia mista é investir 50% imediatamente e o resto em aportes mensais.',
  },
  {
    question: 'O simulador considera custos e impostos?',
    answer: 'O simulador não desconta corretagem, custódia ou imposto sobre ganho de capital (15% acima de R$ 20 mil/mês em vendas). Dividendos são isentos de IR para pessoa física, mas JCP tem 15% retido na fonte. Para resultados mais precisos, considere que seus ganhos reais serão cerca de 2-5% menores devido a esses custos, especialmente se você fizer muitas operações pequenas.',
  },
  {
    question: 'Devo investir em ações de alto dividend yield?',
    answer: 'Não necessariamente. Dividend Yield alto pode indicar: 1) Empresa madura pagando bem os acionistas (bom), 2) Preço da ação caiu muito (cuidado), ou 3) Empresa distribuindo mais do que deveria. Avalie payout (% do lucro distribuído, ideal 40-60%), histórico de pagamentos consistentes, saúde financeira e potencial de crescimento. Empresas com DY médio mas crescimento forte podem ser melhores no longo prazo.',
  },
  {
    question: 'Ações ou FIIs, qual é melhor para dividendos?',
    answer: 'Depende do objetivo. FIIs pagam dividendos mensais e maiores (DY de 8-12%), mas têm menor potencial de valorização. Ações pagam menos em dividendos (DY de 3-8%) mas podem valorizar mais no longo prazo. O ideal é ter ambos: FIIs para renda passiva mensal estável, ações para crescimento de capital e proteção contra inflação. Carteira balanceada pode ter 40-60% ações e 40-60% FIIs, dependendo do perfil.',
  },
  {
    question: 'Como escolher boas ações para investir?',
    answer: `Analise: 1) Fundamentos: lucro consistente, baixo endividamento, boa geração de caixa, 2) Dividendos: histórico de pagamentos, payout sustentável, 3) Setor: defensivos ou com boas perspectivas, 4) Preço: não pagar caro (P/L, P/VP razoáveis), 5) Gestão: empresa bem administrada, 6) Vantagem competitiva: diferenciação, marca forte. Use o simulador para ver como a ação performou no passado e leia análises na ${brand.name}.`,
  },
  {
    question: 'Qual o melhor período para simular?',
    answer: 'Teste diferentes períodos. 5 anos mostra ciclos recentes. 10 anos inclui crises e recuperações. 15-20 anos mostra o verdadeiro poder do longo prazo, mas nem todas as ações têm histórico tão longo. Períodos que incluem crises (2008, 2015-2016, 2020) são especialmente educativos para entender volatilidade e recuperação. Pense sempre no longo prazo, ações são investimentos de 10+ anos.',
  },
  {
    question: 'Como funciona o reinvestimento automático de dividendos no simulador?',
    answer: 'Cada vez que a ação simulada paga dividendo ou JCP, o simulador soma o valor recebido e usa para comprar mais ações no preço de mercado da data do pagamento (frações de ação são permitidas no cálculo). Isso reflete o comportamento real de quem usa DRIP (Dividend Reinvestment Plan). O efeito é exponencial: mais ações geram mais dividendos no próximo ciclo, e assim por diante.',
  },
  {
    question: 'Posso compartilhar uma simulação específica?',
    answer: `Sim. A URL da página guarda os parâmetros: ${brand.url || 'https://redentia.com.br'}/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=ITUB4,VALE3 já abre o simulador preenchido e calcula automaticamente o histórico. Útil pra mandar para o cônjuge, planejador financeiro ou salvar a tese de carteira nos favoritos.`,
  },
  {
    question: 'PETR4 ou VALE3: qual investir?',
    answer: 'Ambas são gigantes commodities-exposure. PETR4 (Petrobras, óleo e gás) tem dividendos volúveis mas extraordinários em ciclos de alta. VALE3 (mineração de ferro) tem dividendos sazonais conforme preço de commodity. Ambas oferecem ~12-15% a.a. histórico em 10+ anos. Pra diversificar, prefira ter as DUAS em peso menor (10-15% cada) e adicionar bancos (ITUB4, BBAS3) e indústria (WEGE3) pra completar a carteira.',
  },
  {
    question: 'O que é estratégia Buy and Hold?',
    answer: 'Buy and Hold significa "comprar e manter". A estratégia consiste em comprar ações de empresas sólidas e segurá-las por anos ou décadas, ignorando oscilações de curto prazo. Defendida por Warren Buffett. Funciona melhor com blue chips brasileiras (ITUB4, ITSA4, BBAS3, BBSE3, WEGE3, ABEV3). Vantagem: você aproveita 100% dos dividendos compostos e não cristaliza prejuízos em crises.',
  },
  {
    question: 'Como meu retorno se compara ao Ibovespa?',
    answer: 'O Ibovespa rende historicamente ~14% a.a. nos últimos 30 anos. Use como benchmark: se sua carteira rende menos que o Ibovespa por 3+ anos consecutivos, vale revisar. Bater o índice consistentemente é difícil mesmo pra gestores profissionais (apenas ~30% conseguem em 10 anos). Se o objetivo é só acompanhar o índice, considere ETFs como BOVA11 (custo zero de gestão própria).',
  },
] as const

const pageTitle = `Simulador de Ações da B3 com Dividendos 2026 | ${brand.name}`
const pageDescription =
  'Simule investimento em PETR4, ITUB4, VALE3, BBAS3, WEGE3 e qualquer ação da B3. Buy and hold com dividendos reinvestidos. Compare com Ibovespa. Grátis.'

usePageSeo({
  title: pageTitle,
  description: pageDescription,
  path: '/calculadora/acoes',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Simulador de Ações', path: '/calculadora/acoes' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `Simulador de Investimento em Ações ${brand.name}`,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Simulador histórico de ações',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      dateModified: lastUpdatedISO,
      description:
        'Simulador gratuito de investimento em ações com dados históricos reais da B3, incluindo dividendos, JCP e reinvestimento automático. Compara múltiplos ativos no mesmo gráfico e exporta histórico de proventos.',
      featureList: [
        'Dados históricos reais da B3 (preços ajustados)',
        'Reinvestimento automático de dividendos e JCP',
        'Simulação com múltiplos ativos simultâneos',
        'Comparação de ações vs FIIs no mesmo gráfico',
        'Histórico detalhado de proventos por data e tipo',
        'Aporte inicial + aporte mensal configuráveis',
        'Cálculo de preço médio e número de ações acumuladas',
        'Rentabilidade total e por ativo',
        'Deep-link compartilhável com tickers e inputs',
        'Cenários populares 1 clique (PETR4, ITUB4, blue chips)',
      ],
      about: [
        { '@type': 'Organization', name: 'B3', url: 'https://www.b3.com.br' },
        { '@type': 'Organization', name: 'CVM', url: 'https://www.gov.br/cvm' },
        { '@type': 'Organization', name: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br' },
        { '@type': 'Organization', name: 'Receita Federal', url: 'https://www.gov.br/receitafederal' },
        { '@type': 'Organization', name: 'IBGE', url: 'https://www.ibge.gov.br' },
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

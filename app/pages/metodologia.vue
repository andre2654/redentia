<template>
  <NuxtLayout :name="layoutName" title="Metodologia e fontes de dados">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Back-link -->
      <NuxtLink
        to="/"
        class="flex items-center gap-1 text-xs transition hover:opacity-80"
        :style="{ color: 'var(--brand-text-muted)' }"
      >
        <UIcon name="i-lucide-chevron-left" class="size-3" />
        Voltar para a home
      </NuxtLink>

      <!-- Hero -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-book-open-check" class="text-secondary h-8 w-8" />
          <h1
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(28px, 4vw, 36px)',
              lineHeight: 1.05,
              letterSpacing: '-0.7px',
            }"
          >Metodologia e fontes de dados</h1>
        </div>
        <p class="text-base md:text-lg" :style="{ color: 'var(--brand-text)' }">
          Esta página explica como o conteúdo da {{ brand.name }} é produzido, quais fontes públicas alimentam as calculadoras e os rankings, quais fórmulas estão por trás de cada simulação e em que situações cada modelo deixa de funcionar bem. O objetivo é deixar visível tudo que sustenta o que você lê aqui, para que você possa replicar, contestar ou aprofundar qualquer cálculo.
        </p>
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-shield-check" class="size-4" :style="{ color: 'var(--brand-positive)' }" />
            Sem patrocínio em calculadoras
          </span>
          <span>·</span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-database" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
            Fontes públicas oficiais
          </span>
          <span>·</span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-refresh-cw" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
            Revisão periódica
          </span>
        </div>
        <p class="text-[11px]" :style="{ color: 'var(--brand-text-muted)' }">
          Última atualização: {{ lastUpdatedText }}
        </p>
      </div>

      <!-- Sumário -->
      <nav
        class="flex flex-col gap-2 rounded-[30px] border p-6"
        :style="{
          backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
          borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
        }"
        aria-label="Índice da página"
      >
        <h2 class="text-base">Sumário</h2>
        <ol class="grid gap-1 text-sm md:grid-cols-2">
          <li><a href="#principios" class="hover:text-secondary underline-offset-4 hover:underline">1. Princípios editoriais</a></li>
          <li><a href="#fontes" class="hover:text-secondary underline-offset-4 hover:underline">2. Fontes de dados</a></li>
          <li><a href="#calculadoras" class="hover:text-secondary underline-offset-4 hover:underline">3. Metodologia das calculadoras</a></li>
          <li><a href="#limitacoes" class="hover:text-secondary underline-offset-4 hover:underline">4. Limitações conhecidas</a></li>
          <li><a href="#atualizacao" class="hover:text-secondary underline-offset-4 hover:underline">5. Atualização de dados</a></li>
          <li><a href="#correcoes" class="hover:text-secondary underline-offset-4 hover:underline">6. Como reportar erro</a></li>
          <li><a href="#disclaimer" class="hover:text-secondary underline-offset-4 hover:underline">7. Disclaimer educacional</a></li>
        </ol>
      </nav>

      <!-- 1. Princípios editoriais -->
      <div class="max-w-none">
        <h2 id="principios">1. Princípios editoriais</h2>
        <p class="leading-relaxed">
          A {{ brand.name }} produz conteúdo sob quatro princípios não-negociáveis. Eles existem porque YMYL (Your Money Your Life), conteúdo financeiro que pode afetar dinheiro, saúde ou bem-estar do leitor, exige um padrão editorial mais alto que conteúdo de entretenimento.
        </p>

        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2 text-secondary">Independência editorial</h3>
            <p class="text-sm">
              Calculadoras, rankings e análises não são patrocinados. Quando há link de afiliado (ex: corretora parceira em um guia), ele é declarado de forma visível na própria página com o aviso "link patrocinado". Nenhum cálculo é alterado para favorecer um produto.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2 text-secondary">Fontes verificáveis</h3>
            <p class="text-sm">
              Todo dado citado em texto editorial vem de fonte primária pública (B3, Banco Central, CVM, IBGE, ANBIMA, Receita Federal). Quando o número é uma média histórica ou estimativa, isso é dito no próprio parágrafo, com janela temporal e provedor.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2 text-secondary">Atualização periódica</h3>
            <p class="text-sm">
              Páginas educacionais são revisadas em ciclo trimestral, ou imediatamente quando ocorre evento relevante (mudança da Selic, alteração de tributação, nova instrução CVM). O campo "Última atualização" no topo de cada página é a fonte da verdade sobre quando o conteúdo foi conferido.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2 text-secondary">Fact-checking interno</h3>
            <p class="text-sm">
              Cada conteúdo publicado passa por dois pares de olhos: redação e revisão de cálculo. Em peças que envolvem tributação, simulação previdenciária ou qualquer número que afete uma decisão financeira do leitor, exigimos checagem cruzada com a fonte oficial citada.
            </p>
          </div>
        </div>

        <!-- 2. Fontes de dados -->
        <h2 id="fontes">2. Fontes de dados</h2>
        <p class="leading-relaxed">
          Toda informação numérica exibida nas páginas da {{ brand.name }} pode ser rastreada até uma das seis fontes abaixo. Não usamos dados de terceiros sem origem rastreável, e quando consumimos um agregador (StatusInvest, ComDinheiro, etc), explicitamos que o dado de base também vem destas fontes oficiais.
        </p>

        <div class="space-y-4">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-trending-up" class="size-5 text-secondary" />
              <a href="https://www.b3.com.br" target="_blank" rel="noopener" class="hover:text-secondary underline-offset-4 hover:underline">B3 (Brasil, Bolsa, Balcão)</a>
            </h3>
            <p class="text-sm">
              Cotações de ações, FIIs, ETFs e BDRs (preço, volume, ticker), composição de índices (Ibovespa, IFIX, IBrX, Small Cap Index), eventos corporativos (dividendos, JCP, splits, grupamentos, bonificações), composição setorial e dados fundamentalistas reportados pelas companhias listadas. Frequência: dados de pregão em tempo real (com até 15 min de defasagem para feed gratuito), eventos diários, fundamentalistas trimestrais.
            </p>
          </div>

          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-landmark" class="size-5 text-secondary" />
              <a href="https://www.bcb.gov.br" target="_blank" rel="noopener" class="hover:text-secondary underline-offset-4 hover:underline">Banco Central do Brasil (BCB)</a>
            </h3>
            <p class="text-sm">
              Taxa Selic Meta e Selic Over (overnight), CDI (Certificado de Depósito Interbancário), índices monetários (TR, TJLP, TLP), expectativas Focus (relatório semanal), boletim Focus (consenso de mercado para Selic, IPCA, PIB, câmbio), séries temporais via SGS (Sistema Gerenciador de Séries Temporais). Frequência: Selic atualizada a cada reunião do Copom (ciclo de ~45 dias), CDI diário, Focus semanal.
            </p>
          </div>

          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-scale" class="size-5 text-secondary" />
              <a href="https://www.gov.br/cvm" target="_blank" rel="noopener" class="hover:text-secondary underline-offset-4 hover:underline">CVM (Comissão de Valores Mobiliários)</a>
            </h3>
            <p class="text-sm">
              Regulação de fundos de investimento, FIIs, ofertas públicas, demonstrações financeiras padronizadas (DFP, ITR), comunicados a mercado, fato relevante, instruções normativas (CVM 555 para fundos abertos, CVM 472 para FIIs). Usamos a CVM como fonte de regras de tributação de fundos e dos prospectos exigidos por instrução. Frequência: instruções publicadas conforme calendário regulatório, dados de fundos diariamente.
            </p>
          </div>

          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-receipt" class="size-5 text-secondary" />
              <a href="https://www.gov.br/receitafederal" target="_blank" rel="noopener" class="hover:text-secondary underline-offset-4 hover:underline">Receita Federal do Brasil</a>
            </h3>
            <p class="text-sm">
              Tabelas vigentes do IRPF, alíquotas de IR sobre ganho de capital em renda variável (15% swing trade, 20% day trade), códigos DARF (6015 para swing trade, 8523 para day trade), regras de isenção (vendas mensais até R$ 20.000 em ações, dividendos isentos), tributação regressiva de renda fixa (22,5% até 180d, 20% até 360d, 17,5% até 720d, 15% acima), instruções de declaração anual.
            </p>
          </div>

          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-bar-chart-3" class="size-5 text-secondary" />
              <a href="https://www.ibge.gov.br" target="_blank" rel="noopener" class="hover:text-secondary underline-offset-4 hover:underline">IBGE (Instituto Brasileiro de Geografia e Estatística)</a>
            </h3>
            <p class="text-sm">
              IPCA (Índice Nacional de Preços ao Consumidor Amplo), IPCA-15, INPC, INCC e demais índices de inflação oficiais, PIB trimestral, indicadores demográficos, séries históricas via Sidra. Em qualquer simulação que considera inflação, IPCA é a referência usada. Para projeções futuras, usamos a meta de inflação (3% com banda de 1,5pp) ou o consenso Focus.
            </p>
          </div>

          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-file-check" class="size-5 text-secondary" />
              <a href="https://www.anbima.com.br" target="_blank" rel="noopener" class="hover:text-secondary underline-offset-4 hover:underline">ANBIMA (Associação Brasileira das Entidades dos Mercados Financeiro e de Capitais)</a>
            </h3>
            <p class="text-sm">
              Autorregulação do mercado de fundos, classificação ANBIMA de fundos (renda fixa, multimercado, ações, cambial, previdência), índices de renda fixa (IMA-B, IMA-S, IRF-M, IDA), curvas de juros futuras, rentabilidade média de tesouro direto, certificações profissionais (CPA-10, CPA-20, CEA, CGA). Frequência: índices ANBIMA atualizados diariamente, classificação revisada por instrução.
            </p>
          </div>
        </div>

        <p class="text-sm">
          Em adição, consumimos APIs públicas e parceiras (Brapi para preços B3 com latência reduzida, scraper proprietário do StatusInvest para fundamentalistas) para reduzir o tempo entre publicação oficial e exibição na plataforma. Toda transformação aplicada (cálculo de DY, P/L, P/VP) parte de dados originados nas fontes acima.
        </p>

        <!-- 3. Metodologia das calculadoras -->
        <h2 id="calculadoras">3. Metodologia das calculadoras</h2>
        <p class="leading-relaxed">
          As calculadoras da {{ brand.name }} são determinísticas: dado o mesmo input, sempre retornam o mesmo output. Não há randomização, não há "machine learning sugerindo número diferente". Abaixo, a fórmula central de cada uma e os pressupostos adotados por padrão.
        </p>

        <div class="space-y-4">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2">
              <NuxtLink to="/calculadora/juros-compostos" class="hover:text-secondary underline-offset-4 hover:underline">Juros compostos</NuxtLink>
            </h3>
            <p class="text-sm">
              Fórmula: <strong>M = C × (1 + i)ⁿ + P × [((1 + i)ⁿ − 1) ÷ i]</strong>, onde M é o montante final, C o capital inicial, i a taxa por período, n o número de períodos e P o aporte mensal. Capitalização mensal por padrão (taxa anual convertida para mensal pela fórmula equivalente i_m = (1 + i_a)^(1/12) − 1). Por padrão, não desconta IR nem inflação, ambos disponíveis como toggle. Aporte feito no início do período (antecipado).
            </p>
          </div>

          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2">
              <NuxtLink to="/calculadora/preco-teto" class="hover:text-secondary underline-offset-4 hover:underline">Preço teto</NuxtLink>
            </h3>
            <p class="text-sm">
              Quatro metodologias exibidas em paralelo: <strong>Graham</strong> (PT = √(22,5 × LPA × VPA), válido para LPA e VPA positivos), <strong>Bazin</strong> (PT = Dividendo médio anual ÷ 0,06, equivalente a exigir DY mínimo de 6% a.a.), <strong>P/L setorial</strong> (PT = LPA × P/L mediano do setor), <strong>VPA × 1,5</strong> (apenas para bancos e financeiras, onde patrimônio é a métrica natural). LPA, VPA e dividendos vêm dos últimos 12 meses publicados na DFP/ITR.
            </p>
          </div>

          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2">
              <NuxtLink to="/calculadora/dividend-yield" class="hover:text-secondary underline-offset-4 hover:underline">Dividend yield</NuxtLink>
            </h3>
            <p class="text-sm">
              <strong>DY = (Dividendos anuais por ação ÷ Preço da ação) × 100</strong>, expresso em percentual. DY de mercado usa preço atual; DY on cost (yield sobre custo) usa o preço médio de aquisição informado pelo usuário. Considera proventos pagos nos últimos 12 meses (TTM, trailing twelve months), incluindo dividendos e JCP líquido (15% IR já descontado, conforme regra atual).
            </p>
          </div>

          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2">
              <NuxtLink to="/calculadora/imposto-renda" class="hover:text-secondary underline-offset-4 hover:underline">IR sobre ações</NuxtLink>
            </h3>
            <p class="text-sm">
              Alíquotas vigentes da Receita Federal: <strong>15% de IR sobre swing trade</strong> (vendas em pregão diferente da compra), <strong>20% sobre day trade</strong> (compra e venda no mesmo pregão), isenção para vendas mensais somadas até R$ 20.000 em ações comuns (não vale para day trade, FIIs, ETFs ou BDRs). Códigos DARF: <strong>6015</strong> para swing trade, <strong>8523</strong> para day trade. Compensação de prejuízo permitida na mesma modalidade, sem prazo de validade.
            </p>
          </div>

          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2">
              <NuxtLink to="/calculadora/aposentadoria" class="hover:text-secondary underline-offset-4 hover:underline">Aposentadoria</NuxtLink>
            </h3>
            <p class="text-sm">
              Baseada na <strong>regra dos 4%</strong> (Trinity Study, Cooley/Hubbard/Walz, 1998), que sugere que uma carteira balanceada permite saque anual de 4% do patrimônio inicial corrigido por inflação, com alta probabilidade de durar 30 anos. INSS é opcional (usuário define se quer somar contribuição estimada do RGPS). Inflação ajustável (padrão IPCA esperado de 4% a.a.). A regra dos 4% é referencial, não garantia, taxas de retorno historicamente oscilaram entre 6% e 10% reais ao ano em carteiras 60/40.
            </p>
          </div>

          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2">
              <NuxtLink to="/calculadora/quanto-investir" class="hover:text-secondary underline-offset-4 hover:underline">Quanto investir</NuxtLink>
            </h3>
            <p class="text-sm">
              Cálculo do aporte mensal necessário pra atingir uma meta financeira em prazo definido, partindo do <strong>valor presente de uma série uniforme antecipada</strong>: P = (M − C × (1 + i)ⁿ) ÷ [((1 + i)ⁿ − 1) ÷ i]. Permite informar capital inicial, meta nominal ou ajustada por inflação, e taxa esperada. Não considera impostos automaticamente, recomendamos descontar 15-22,5% no caso de meta com retorno via renda fixa.
            </p>
          </div>

          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2">
              <NuxtLink to="/calculadora/planejamento" class="hover:text-secondary underline-offset-4 hover:underline">Planejamento patrimonial</NuxtLink>
            </h3>
            <p class="text-sm">
              Backtesting com séries históricas reais da B3 desde 2010, considerando reinvestimento de dividendos e JCP. Otimização por estratégia escolhida pelo usuário: <strong>rentabilidade</strong> (maximiza retorno esperado, aceitando volatilidade) ou <strong>segurança</strong> (minimiza desvio padrão, aceitando retorno menor). Não é recomendação de carteira, é simulação retroativa, performance passada não garante resultado futuro, especialmente em janelas curtas.
            </p>
          </div>

          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h3 class="mb-2">
              <NuxtLink to="/calculadora/acoes" class="hover:text-secondary underline-offset-4 hover:underline">Simulador de ações</NuxtLink>
            </h3>
            <p class="text-sm">
              Backtest real ticker a ticker com dados B3 históricos. Considera <strong>dividendos e JCP reinvestidos</strong> na data ex-, ajusta para splits, grupamentos e bonificações via fator de ajuste. Resultado mostra retorno total (capital + proventos), retorno anualizado (CAGR) e drawdown máximo da janela. Não inclui custos de corretagem nem emolumentos da B3 (aproximadamente 0,03% por operação), valores brutos antes de qualquer custo transacional.
            </p>
          </div>
        </div>

        <!-- 4. Limitações conhecidas -->
        <h2 id="limitacoes">4. Limitações conhecidas</h2>
        <p class="leading-relaxed">
          Toda calculadora opera sob pressupostos. Listamos abaixo o que cada uma <em>não</em> faz, para que você consiga calibrar o resultado mentalmente.
        </p>

        <div class="space-y-3">
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-1">Não modelamos impostos automaticamente, exceto onde dito</h4>
            <p class="text-sm">
              Calculadoras de juros compostos, quanto investir e aposentadoria mostram montante <em>bruto</em>. Para chegar ao líquido em renda fixa, desconte a alíquota regressiva (15% após 720 dias). Em ações, considere 15% sobre ganho de capital se vendas mensais ultrapassarem R$ 20.000.
            </p>
          </div>

          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-1">Não consideramos taxas de corretagem, emolumentos B3 e custódia</h4>
            <p class="text-sm">
              Hoje a maioria das corretoras oferece corretagem zero em ações e FIIs, mas emolumentos da B3 (~0,03% por trade) e ISS sobre corretagem (variável) ainda incidem. Para volume significativo, descontar ~0,05% por operação dá uma boa aproximação.
            </p>
          </div>

          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-1">Rentabilidades passadas não garantem futuras</h4>
            <p class="text-sm">
              Backtests do simulador de ações e do planejamento patrimonial mostram o que aconteceu com aquela carteira na janela escolhida. Mudanças regulatórias, ciclos de juros, eventos macro e o próprio fato de o ativo ter performado bem alteram a probabilidade futura. Use o backtest como sanity check, não como projeção.
            </p>
          </div>

          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-1">Preço teto Graham e Bazin assumem pressupostos não testados</h4>
            <p class="text-sm">
              A fórmula de Graham foi desenhada nos EUA dos anos 1940 e mistura crescimento (LPA) com patrimônio (VPA) sem ajuste setorial. Bazin exige DY mínimo de 6% a.a., uma régua arbitrária. Use como ponto de partida, não como resposta única. Setores cíclicos (commodities, montadoras) e high-growth (tecnologia) podem precisar de modelagem alternativa (DCF, múltiplos prospectivos).
            </p>
          </div>

          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-1">Regra dos 4% pode ser conservadora ou otimista</h4>
            <p class="text-sm">
              O estudo Trinity foi calibrado em mercado americano com janela 1926-1995. No Brasil, com Selic alta histórica, taxa segura de saque pode ser maior; em janelas pós-Plano Real (1994-2026) com volatilidade alta, pode ser menor. Ajuste para sua realidade.
            </p>
          </div>

          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-1">Dividend yield TTM olha pra trás, não pra frente</h4>
            <p class="text-sm">
              DY TTM (últimos 12 meses) é descritivo. Empresas que pagaram dividendo extraordinário recente exibem DY inflado que não se repetirá. Empresas em ciclo de investimento podem reduzir payout temporariamente. Sempre conferir o histórico de payout antes de decidir.
            </p>
          </div>
        </div>

        <!-- 5. Atualização de dados -->
        <h2 id="atualizacao">5. Atualização de dados</h2>
        <p class="leading-relaxed">
          A camada de dados que alimenta cotações, fundamentalistas e calendários roda em microsserviços dedicados (news-scraper, fundamentals-scraper, chat-service), com cron jobs específicos por tipo de dado.
        </p>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
            >
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Tipo de dado</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Frequência</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Origem</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Cotações intraday durante pregão</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Cron 10 a 30 min</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Brapi (B3)</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Cotações de fechamento</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Diária após pregão</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">B3 oficial via API</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Fundamentalistas (P/L, P/VP, ROE, margens)</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Diária</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Scraper StatusInvest, base em DFP/ITR</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Calendário de dividendos</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Diária</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">B3 (avisos a acionistas)</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Selic, CDI, IPCA</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Diária (CDI), por reunião Copom (Selic), mensal (IPCA)</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">BCB SGS, IBGE Sidra</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Tesouro Direto</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Diária (preços), mensal (rentabilidade ANBIMA)</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Tesouro Nacional, ANBIMA</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Notícias e fato relevante</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Cron 5 min</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Feeds RSS oficiais (CVM, B3, releases corporativos)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="text-sm">
          Quando a janela do pregão fecha (após 18h em horário de Brasília), o preço exibido é o de fechamento e permanece até a abertura do pregão seguinte. Em finais de semana e feriados, todos os ativos B3 mostram o último fechamento conhecido.
        </p>

        <!-- 6. Como reportar erro -->
        <h2 id="correcoes">6. Como reportar erro</h2>
        <p class="leading-relaxed">
          Se você identificou divergência entre um número exibido e a fonte oficial, ou um erro de fórmula, ou um conteúdo que precisa ser atualizado, escreva para <a :href="`mailto:${brand.email}`" class="hover:text-secondary underline">{{ brand.email }}</a> com o link da página, o trecho em questão e a fonte que sustenta a correção. Resposta em até 5 dias úteis. Quando a correção for aplicada, atualizamos o campo "Última atualização" da página afetada.
        </p>

        <!-- 7. Disclaimer educacional -->
        <h2 id="disclaimer">7. Disclaimer educacional</h2>
        <div
          class="brand-card border-l-4 p-5"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
            borderColor: 'var(--brand-primary)',
          }"
        >
          <p class="text-sm">
            Todo o conteúdo da {{ brand.name }} é exclusivamente <strong>educacional e informativo</strong>. Não constitui recomendação de compra, venda ou manutenção de qualquer ativo, nem aconselhamento personalizado de investimento. Calculadoras, simuladores e análises servem para apoiar o seu processo de decisão, mas não substituem a avaliação do seu perfil, objetivos e tolerância a risco por um profissional certificado.
          </p>
          <p class="mt-3 text-sm">
            Antes de tomar qualquer decisão financeira relevante, consulte um <strong>profissional certificado</strong>: assessor de investimentos credenciado pela CVM (AAI), planejador financeiro (CFP, certificado pela Planejar), gestor de carteiras (CGA, certificado pela ANBIMA), ou consultor de valores mobiliários autorizado pela CVM. A {{ brand.name }} não é corretora, distribuidora, gestora ou agente autônomo, e não recebe ordens de compra ou venda.
          </p>
        </div>
      </div>

      <!-- Autoria e E-E-A-T -->
      <aside
        class="flex flex-col gap-3 rounded-2xl border p-6 md:flex-row md:items-center md:gap-6"
        :style="{
          backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
          borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
        }"
      >
        <div class="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary/20">
          <UIcon name="i-lucide-users" class="size-7 text-secondary" />
        </div>
        <div class="flex flex-col gap-1 text-sm">
          <p>
            Conteúdo produzido e revisado pela equipe editorial da {{ brand.name }}, com base em fontes públicas (B3, BCB, CVM, Receita Federal, IBGE, ANBIMA).
          </p>
          <p>
            Encontrou divergência ou erro? Reporte em <a href="mailto:contato@redentia.com.br" class="underline hover:text-secondary">contato@redentia.com.br</a>.
          </p>
        </div>
      </aside>

      <!-- CTA -->
      <MoleculesCtaSection
        title="Quer aplicar o que aprendeu?"
        :description="`Use as calculadoras da ${brand.name} ou crie uma conta para acompanhar sua carteira em tempo real.`"
        :buttons="[
          { label: 'Ver calculadoras', to: '/calculadora', icon: 'i-lucide-calculator', variant: 'primary' },
          { label: 'Criar conta grátis', to: '/auth/register', variant: 'outline' },
        ]"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
const brand = useBrand()
const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)

// Data de atualização do conteúdo. Bump manual quando houver revisão real
// da metodologia (mudança de fórmula, nova fonte, nova calculadora coberta).
const CONTENT_VERSION = '2026-05-05'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const lastUpdatedISO = lastUpdated.toISOString()

const author = useAuthorSchema()

const pageTitle = `Metodologia e fontes de dados | ${brand.name}`
const pageDescription =
  'Como o conteúdo da Redentia é produzido, quais fontes oficiais (B3, BCB, CVM, IBGE, ANBIMA) alimentam as calculadoras e quais limitações cada modelo tem.'

usePageSeo({
  title: pageTitle,
  description: pageDescription,
  path: '/metodologia',
  type: 'article',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Metodologia', path: '/metodologia' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Metodologia e fontes de dados',
      description: pageDescription,
      inLanguage: 'pt-BR',
      datePublished: lastUpdatedISO,
      dateModified: lastUpdatedISO,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${brand.url}/metodologia`,
      },
      author: author.value,
      about: [
        { '@type': 'Organization', name: 'B3', url: 'https://www.b3.com.br' },
        { '@type': 'Organization', name: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br' },
        { '@type': 'Organization', name: 'CVM', url: 'https://www.gov.br/cvm' },
        { '@type': 'Organization', name: 'Receita Federal', url: 'https://www.gov.br/receitafederal' },
        { '@type': 'Organization', name: 'IBGE', url: 'https://www.ibge.gov.br' },
        { '@type': 'Organization', name: 'ANBIMA', url: 'https://www.anbima.com.br' },
        { '@type': 'Thing', name: 'Metodologia de cálculo financeiro' },
        { '@type': 'Thing', name: 'Fontes de dados de mercado brasileiro' },
      ],
    },
  ],
})

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})
</script>

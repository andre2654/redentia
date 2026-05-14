<template>
  <NuxtLayout name="default" title="Calculadora de Planejamento Patrimonial">
    <CalculatorPlanning
      :assets="assets"
      back-to="/calculadora"
      back-label="Todas as calculadoras"
      :last-updated="lastUpdatedText"
    >
      <template #hero>
        <p class="calc-eyebrow">Calculadora · Planejamento Patrimonial</p>
        <h1 class="calc-title">
          Caminho para a liberdade
          <em class="calc-italic">financeira.</em>
        </h1>
        <p class="calc-lead">
          Esta calculadora monta uma carteira recomendada da B3 com base em <strong>dados históricos reais</strong> pra atingir sua meta. Define meta + aporte mensal + estratégia (rentabilidade ou segurança), retorna 5-10 ativos com pesos específicos e projeção de quando você atinge o objetivo. Exemplo: meta de R$ 1 milhão com R$ 2.000/mês na estratégia rentabilidade leva ~18 anos.
        </p>
        <ul class="calc-chips">
          <li><span class="dot positive" /> 100% gratuito</li>
          <li><span class="dot" /> Cálculo instantâneo</li>
          <li><span class="dot" /> Carteira sugerida com pesos</li>
          <li><span class="dot" /> Dados históricos reais B3</li>
        </ul>
      </template>
    </CalculatorPlanning>

    <section class="calc-aux flex flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8">

      <!-- Cenarios populares (internal linking + deep-links) -->
      <!--
        Cada link e uma "landing page virtual" que o Google indexa
        independente. Planning.vue le `?goal=`, `?monthly=`, `?strategy=`
        e ja dispara o calculo no mount. Foco em long-tails que combinam
        meta + perfil + horizonte ("aposentadoria 1 milhao", "FIRE em
        15 anos", "entrada de imovel R$ 150 mil", etc).
      -->
      <div
        class="flex flex-col gap-3 rounded-lg border p-4 sm:p-6"
        :style="{
          backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
          borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
        }"
      >
        <h2>Cenários populares de planejamento</h2>
        <p class="text-sm">
          Veja na hora a carteira sugerida e o tempo até a meta dos cenários mais buscados, basta clicar e a simulação carrega já preenchida.
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
      <div class="quiet-prose calc-edu-prose max-w-none">
        <h2>Simulador de Planejamento Patrimonial grátis e online</h2>
        <h2>O que é Planejamento Patrimonial?</h2>
        <p class="leading-relaxed">
          Planejamento patrimonial é o processo de definir metas financeiras claras e criar uma estratégia concreta para alcançá-las. Não basta apenas "investir", você precisa saber exatamente quanto investir, por quanto tempo, e em quais ativos, para realizar seus objetivos.
        </p>
        <p class="leading-relaxed">
          Nossa calculadora vai além de simulações genéricas: ela analisa dados históricos reais de centenas de ativos da B3, monta uma carteira otimizada para seu perfil, e projeta quando você atingirá sua meta. Tudo baseado em performance real, não em promessas.
        </p>

        <h3>Por que Fazer um Planejamento Patrimonial?</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              Clareza de Objetivos
            </h4>
            <p class="text-sm">
              Transforme sonhos vagos em metas concretas. "Quero ficar rico" vira "Preciso de R$ 500 mil em 15 anos investindo R$ 1.500/mês".
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
              Estratégia Realista
            </h4>
            <p class="text-sm">
              Baseada em dados reais, não em otimismo exagerado. Você saberá se sua meta é viável ou se precisa ajustar aportes/prazos.
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
              Carteira Personalizada
            </h4>
            <p class="text-sm">
              Receba recomendações de ativos específicos, com pesos definidos, baseadas em performance histórica e seu perfil de risco.
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
              Acompanhamento do Progresso
            </h4>
            <p class="text-sm">
              Com metas claras, você pode acompanhar seu progresso mensalmente e fazer ajustes conforme necessário.
            </p>
          </div>
        </div>

        <h2>Reserva de Emergência: Pré-requisito do Planejamento</h2>
        <p class="leading-relaxed">
          Antes de qualquer estratégia patrimonial, monte uma reserva de emergência. Quanto: 6 a 12 meses do seu custo de vida (autônomo ou renda variável: 12 meses; CLT estável: 6 meses). Onde guardar: Tesouro Selic 2030, CDB com liquidez diária de banco grande (FGC até R$ 250 mil), conta remunerada como Nubank, Inter ou C6 que rende ~100% do CDI.
        </p>
        <p class="leading-relaxed">
          Por que: pra não precisar vender investimentos de longo prazo no pior momento (queda de bolsa, mercado em pânico). Exemplo prático: se você gasta R$ 4 mil/mês, sua reserva é R$ 24-48 mil. Se gasta R$ 8 mil/mês, fica entre R$ 48-96 mil. Sem essa proteção, qualquer evento inesperado (saúde, demissão, conserto grande) vira motivo pra cristalizar prejuízo.
        </p>

        <h2>Como Usar a Calculadora de Planejamento</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              1
            </div>
            <div>
              <h4>Defina Sua Meta Financeira</h4>
              <p class="text-sm">
                Quanto você quer acumular? Pense em objetivos concretos: R$ 300 mil para entrada de um imóvel, R$ 1 milhão para aposentadoria, R$ 500 mil para liberdade financeira. Seja específico.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              2
            </div>
            <div>
              <h4>Defina Seu Aporte Mensal</h4>
              <p class="text-sm">
                Quanto você consegue investir todo mês de forma consistente? Seja realista, é melhor prometer menos e cumprir do que ser ambicioso e desistir. Lembre-se: consistência vence valor.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              3
            </div>
            <div>
              <h4>Escolha Sua Estratégia</h4>
              <p class="text-sm">
                <strong>Maior rentabilidade:</strong> Foca em ativos que tiveram melhor desempenho histórico (maior retorno, mas maior volatilidade). <strong>Maior segurança:</strong> Prioriza ativos defensivos e inclui renda fixa para estabilidade.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              4
            </div>
            <div>
              <h4>Analise os Resultados</h4>
              <p class="text-sm">
                Veja quanto tempo levará para atingir sua meta, a carteira recomendada com pesos específicos de cada ativo, projeção de patrimônio e comparação com dados históricos reais.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              5
            </div>
            <div>
              <h4>Execute e Monitore</h4>
              <p class="text-sm">
                Use a carteira recomendada como base, adapte conforme seu conhecimento e perfil, e revise trimestralmente. Ajuste aportes se sua renda mudar.
              </p>
            </div>
          </div>
        </div>

        <h2>Asset Allocation: Alocação de Ativos por Perfil</h2>
        <p class="leading-relaxed">
          Asset allocation é a distribuição percentual da carteira entre classes de ativos: ações, FIIs, renda fixa, ouro, internacional. A decisão estratégica de "quanto em cada classe" pesa mais que qual ativo individual escolher dentro da classe.
        </p>
        <p class="leading-relaxed">
          Por que importa: o estudo clássico de Brinson, Hood e Beebower (1986) mostra que cerca de 90% da variação de retorno de longo prazo de uma carteira vem da alocação entre classes, NÃO da escolha de ativos individuais. Ou seja, decidir 60% renda variável + 40% renda fixa importa mais que escolher entre ITUB4 ou BBDC4 dentro da fatia de ações.
        </p>
        <div class="grid gap-4 md:grid-cols-3">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Conservador</h4>
            <p class="text-sm">
              80% renda fixa + 15% FIIs + 5% ações. Foco em preservar capital, baixíssima volatilidade. Ideal pra quem está perto de usar o dinheiro ou tem aversão forte a oscilação.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Moderado</h4>
            <p class="text-sm">
              50% renda fixa + 30% renda variável (ações + FIIs) + 20% internacional/ouro. Equilíbrio clássico entre crescimento e proteção. Bom default pra quem está construindo patrimônio.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Arrojado</h4>
            <p class="text-sm">
              70% renda variável + 20% internacional + 10% renda fixa pra reserva. Maximiza retorno de longo prazo. Só faz sentido com horizonte de 10+ anos e tolerância real a quedas de 30-50%.
            </p>
          </div>
        </div>

        <h2>Estratégias de Planejamento</h2>

        <h3>Maior Rentabilidade</h3>
        <div
          class="brand-card border p-5"
          :style="{
            borderColor: `color-mix(in srgb, var(--brand-positive) 20%, transparent)`,
            backgroundColor: `color-mix(in srgb, var(--brand-positive) 10%, transparent)`,
          }"
        >
          <h4 class="mb-3" :style="{ color: 'var(--brand-positive)' }">
            Para quem: Investidores com tolerância a risco e horizonte longo (10+ anos)
          </h4>
          <p class="text-sm mb-3">
            Esta estratégia seleciona ativos com melhor performance histórica, priorizando crescimento de capital. Pode ter maior volatilidade no curto prazo, mas tende a maximizar retornos no longo prazo.
          </p>
          <div class="space-y-2 text-sm">
            <p>Características:</p>
            <ul class="space-y-1">
              <li>• 80-90% em ações de alto crescimento e blue chips</li>
              <li>• 10-20% em FIIs consolidados</li>
              <li>• Foco em setores com boas perspectivas futuras</li>
              <li>• Maior exposição a small caps de qualidade</li>
              <li>• Retorno histórico médio: 14-18% a.a.</li>
            </ul>
          </div>
        </div>

        <h3>Maior Segurança</h3>
        <div
          class="brand-card border p-5"
          :style="{
            borderColor: `color-mix(in srgb, var(--brand-primary) 20%, transparent)`,
            backgroundColor: `color-mix(in srgb, var(--brand-primary) 10%, transparent)`,
          }"
        >
          <h4 class="mb-3" :style="{ color: 'var(--brand-primary)' }">
            Para quem: Investidores conservadores ou próximos de usar o dinheiro (5-10 anos)
          </h4>
          <p class="text-sm mb-3">
            Esta estratégia prioriza estabilidade e previsibilidade. Seleciona empresas consolidadas, setores defensivos e inclui renda fixa para reduzir volatilidade.
          </p>
          <div class="space-y-2 text-sm">
            <p>Características:</p>
            <ul class="space-y-1">
              <li>• 50-60% em ações de setores defensivos (bancos, energia, saneamento)</li>
              <li>• 30-40% em FIIs consolidados e diversificados</li>
              <li>• 10% em renda fixa (Tesouro Direto, CDBs)</li>
              <li>• Foco em pagadores consistentes de dividendos</li>
              <li>• Retorno histórico médio: 10-13% a.a.</li>
            </ul>
          </div>
        </div>

        <h2>Exemplos de Metas e Resultados</h2>

        <h3>Exemplo 1: Aposentadoria Antecipada</h3>
        <div class="space-y-3">
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2">João, 30 anos - Meta: R$ 1 milhão</h4>
            <ul class="text-sm mb-3">
              <li>Aporte mensal: R$ 2.000</li>
              <li>Estratégia: Maior rentabilidade</li>
              <li>Horizonte: 20 anos</li>
            </ul>
            <div class="rounded-lg bg-secondary/20 p-3">
              <p class="text-sm">
                Resultado: Alcança meta em aproximadamente 18 anos
              </p>
              <p class="text-xs">
                Total investido: R$ 432.000 | Ganho projetado: R$ 568.000
              </p>
              <p class="text-xs mt-2">
                Carteira sugerida: 40% ITUB4, 20% VALE3, 15% WEGE3, 15% PETR4, 10% BBDC4
              </p>
            </div>
          </div>
        </div>

        <h3>Exemplo 2: Entrada de Imóvel</h3>
        <div class="space-y-3">
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2">Maria, 25 anos - Meta: R$ 150.000</h4>
            <ul class="text-sm mb-3">
              <li>Aporte mensal: R$ 1.500</li>
              <li>Estratégia: Maior rentabilidade</li>
              <li>Horizonte: 7 anos</li>
            </ul>
            <div class="rounded-lg bg-secondary/20 p-3">
              <p class="text-sm">
                Resultado: Alcança meta em aproximadamente 6,5 anos
              </p>
              <p class="text-xs">
                Total investido: R$ 117.000 | Ganho projetado: R$ 33.000
              </p>
              <p class="text-xs mt-2">
                Carteira sugerida: 35% PETR4, 25% VALE3, 20% BBDC4, 20% WEGE3
              </p>
            </div>
          </div>
        </div>

        <h3>Exemplo 3: Renda Passiva para Aposentadoria</h3>
        <div class="space-y-3">
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2">Carlos, 45 anos - Meta: R$ 800.000</h4>
            <ul class="text-sm mb-3">
              <li>Aporte mensal: R$ 3.000</li>
              <li>Estratégia: Maior segurança</li>
              <li>Horizonte: 15 anos (aposentar aos 60)</li>
            </ul>
            <div class="rounded-lg bg-secondary/20 p-3">
              <p class="text-sm">
                Resultado: Alcança meta em aproximadamente 14 anos
              </p>
              <p class="text-xs">
                Total investido: R$ 540.000 | Ganho projetado: R$ 260.000
              </p>
              <p class="text-xs mt-2">
                Carteira sugerida: 30% FIIs diversos, 25% ITUB4, 20% BBDC4, 15% PETR4, 10% Renda Fixa
              </p>
              <p class="text-xs mt-1">
                Com R$ 800 mil gerando 10% a.a., terá R$ 6.600/mês de renda passiva
              </p>
            </div>
          </div>
        </div>

        <h2>Como Interpretar a Carteira Recomendada</h2>
        <p class="leading-relaxed">
          A carteira recomendada mostra ativos específicos e seus pesos sugeridos. Veja o que cada informação significa:
        </p>

        <div class="space-y-3">
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-1 text-secondary">Ticker e Nome</h4>
            <p class="text-sm">
              O código da ação (ex: PETR4) e nome da empresa. Use esses códigos para comprar na sua corretora.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-1 text-secondary">Peso (%)  </h4>
            <p class="text-sm">
              Quanto do seu aporte deve ir para cada ativo. Ex: Se você investe R$ 1.000/mês e PETR4 tem peso de 20%, deve comprar R$ 200 em PETR4 por mês.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-1 text-secondary">Retorno Histórico</h4>
            <p class="text-sm">
              Quanto o ativo rendeu no período analisado. Passado não garante futuro, mas mostra o potencial.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-1 text-secondary">CAGR (Retorno Anual Composto)</h4>
            <p class="text-sm">
              A taxa média anual de crescimento. É mais precisa que retorno total para comparar ativos.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-1 text-secondary">Dividendos Totais</h4>
            <p class="text-sm">
              Quanto você teria recebido em proventos reinvestidos ao longo do período. Muitas vezes representa 30-50% do retorno total.
            </p>
          </div>
        </div>

        <h2>Planejamento Patrimonial vs Planejamento Sucessório</h2>
        <p class="leading-relaxed">
          Os dois conceitos são complementares mas têm focos distintos. Planejamento patrimonial foca em ACUMULAR e GERIR riqueza durante a vida ativa do investidor, escolha de ativos, asset allocation, otimização tributária. Planejamento sucessório foca em TRANSMITIR esse patrimônio aos herdeiros com mínimo de impostos e mínimo de conflito, é uma camada que entra em cena quando o patrimônio começa a ficar relevante.
        </p>
        <p class="leading-relaxed">
          Quando faz sentido planejar a sucessão: patrimônio acima de R$ 500 mil, múltiplos herdeiros, atividade empresarial em andamento, ou casamento em comunhão de bens com complexidades familiares.
        </p>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Instrumentos clássicos</h4>
            <p class="text-sm">
              Testamento (define partilha além da regra legal), doação em vida com usufruto (você fica com a renda enquanto vivo), holding familiar (PJ que centraliza patrimônio), seguro de vida resgatável (não entra em inventário).
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">ITCMD e custos</h4>
            <p class="text-sm">
              ITCMD (imposto de transmissão por herança) varia de 4% a 8% conforme o estado. Holding familiar costuma render economia tributária + planejamento, mas custa R$ 5-15 mil/ano de manutenção, só faz sentido pra patrimônio acima de R$ 1 milhão.
            </p>
          </div>
        </div>

        <MoleculesFAQ
          title="Perguntas Frequentes"
          :items="faqItems"
        />

        <h2>Dicas para Executar Seu Planejamento</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              1. Automatize Seus Aportes
            </h4>
            <p class="text-sm">
              Configure transferências automáticas da sua conta para a corretora. Trate o investimento como uma conta que você DEVE pagar todo mês.
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
              2. Comece Hoje
            </h4>
            <p class="text-sm">
              Não espere "ter mais dinheiro" ou "estudar mais". Comece com o que você tem e aprenda fazendo. Cada mês que passa é um mês perdido de juros compostos.
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
              3. Mantenha Reserva de Emergência
            </h4>
            <p class="text-sm">
              Antes de investir pesado, tenha 6 meses de despesas em renda fixa líquida. Isso evita vender investimentos em emergências.
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
              4. Celebre Marcos
            </h4>
            <p class="text-sm">
              Ao atingir 25%, 50%, 75% da meta, celebre! Isso mantém a motivação para os próximos anos de disciplina.
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
              5. Eduque-se Continuamente
            </h4>
            <p class="text-sm">
              Leia sobre investimentos, acompanhe notícias econômicas, estude os ativos da sua carteira. Conhecimento reduz ansiedade e melhora decisões.
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
              6. Ajuste Quando Necessário
            </h4>
            <p class="text-sm">
              Se sua renda aumentar, aumente os aportes. Se sua meta mudar, refaça o planejamento. Flexibilidade é importante, mas mantenha a disciplina.
            </p>
          </div>
        </div>

        <h2>Erros Comuns a Evitar</h2>
        <div class="space-y-3">
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: `color-mix(in srgb, var(--brand-negative) 25%, transparent)`,
              backgroundColor: `color-mix(in srgb, var(--brand-negative) 8%, transparent)`,
            }"
          >
            <h4 class="mb-1" :style="{ color: 'var(--brand-negative)' }">Metas Irrealistas</h4>
            <p class="text-sm">
              Querer R$ 1 milhão em 5 anos investindo R$ 500/mês não é viável. Use a calculadora para definir metas realistas baseadas em dados reais.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: `color-mix(in srgb, var(--brand-negative) 25%, transparent)`,
              backgroundColor: `color-mix(in srgb, var(--brand-negative) 8%, transparent)`,
            }"
          >
            <h4 class="mb-1" :style="{ color: 'var(--brand-negative)' }">Pular Aportes Mensais</h4>
            <p class="text-sm">
              Inconsistência destrói o planejamento. Se você investe 10 meses e pula 2, perde muito do efeito composto. Seja consistente.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: `color-mix(in srgb, var(--brand-negative) 25%, transparent)`,
              backgroundColor: `color-mix(in srgb, var(--brand-negative) 8%, transparent)`,
            }"
          >
            <h4 class="mb-1" :style="{ color: 'var(--brand-negative)' }">Vender em Pânico</h4>
            <p class="text-sm">
              Crises acontecem. Quedas de 20-30% são normais em ações. Vender em pânico cristaliza prejuízos. Mantenha a estratégia de longo prazo.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: `color-mix(in srgb, var(--brand-negative) 25%, transparent)`,
              backgroundColor: `color-mix(in srgb, var(--brand-negative) 8%, transparent)`,
            }"
          >
            <h4 class="mb-1" :style="{ color: 'var(--brand-negative)' }">Perseguir "Dicas Quentes"</h4>
            <p class="text-sm">
              Não abandone seu planejamento para investir na "ação da vez". Especulação geralmente resulta em perdas. Siga seu plano.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: `color-mix(in srgb, var(--brand-negative) 25%, transparent)`,
              backgroundColor: `color-mix(in srgb, var(--brand-negative) 8%, transparent)`,
            }"
          >
            <h4 class="mb-1" :style="{ color: 'var(--brand-negative)' }">Ignorar Diversificação</h4>
            <p class="text-sm">
              Concentrar tudo em 1-2 ações é extremamente arriscado. Diversifique entre setores e tipos de ativos como recomendado.
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
      <div
        class="flex flex-col gap-4 rounded-lg p-6"
        :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
      >
        <h2>Outras Ferramentas</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/juros-compostos"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <UIcon
              name="i-lucide-trending-up"
              class="text-secondary size-8 shrink-0"
            />
            <div>
              <h3>Calculadora de Juros Compostos</h3>
              <p class="text-sm">
                Simule investimentos com taxas fixas
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
                Analise histórico real de ativos da B3
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- CTA -->
      <MoleculesCtaSection
        :title="`Acompanhe seu progresso na ${brand.name}`"
        description="Crie sua conta e monitore sua carteira real, receba alertas personalizados e análises com IA."
        :buttons="[
          { label: 'Criar conta grátis', to: '/auth/register', icon: 'i-lucide-arrow-right', variant: 'primary' },
          { label: 'Ver mais guias', to: '/guias', variant: 'outline' },
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
  'assets-calculator-planejamento',
  () => getAssets()
)

const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)

// Rankings relacionados — pontes pra carteiras otimizadas, upside e
// ROE, naturais pra quem planeja patrimonio.
const relatedRankings = [
  {
    to: '/ranking/buy-and-hold',
    icon: 'i-lucide-shield-check',
    title: 'Buy and Hold (carteira otimizada)',
    sub: 'Score Redent pra horizonte longo',
  },
  {
    to: '/ranking/maior-potencial-upside',
    icon: 'i-lucide-rocket',
    title: 'Maior potencial de upside',
    sub: 'Consenso de analistas vs preço atual',
  },
  {
    to: '/ranking/maiores-roe',
    icon: 'i-lucide-trending-up',
    title: 'Maiores ROEs',
    sub: 'Empresas mais rentáveis sobre o equity',
  },
] as const

const assets = computed(() => assetsData.value ?? [])

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
// Cada cenario combina meta+aporte+estrategia em uma URL canonica que o
// Planning.vue ja le no mount (via parseNumberParam) e dispara o
// calculo automaticamente. Mantenha alinhado com queries reais do GSC
// ("aposentadoria 1 milhao", "FIRE em 15 anos", "entrada de imovel
// 150 mil", etc) e atualize periodicamente.
// ====================================================================
const popularScenarios = [
  { label: 'R$ 1 milhão em 20 anos', sub: 'Aporte de R$ 1.500/mês', icon: 'i-lucide-trophy', to: '/calculadora/planejamento?goal=1000000&monthly=1500&strategy=rentabilidade' },
  { label: 'R$ 500 mil em 10 anos', sub: 'Médio prazo, perfil agressivo', icon: 'i-lucide-target', to: '/calculadora/planejamento?goal=500000&monthly=2500&strategy=rentabilidade' },
  { label: 'R$ 800 mil aposentadoria', sub: 'Carlos, 45 anos, R$ 3k/mês', icon: 'i-lucide-armchair', to: '/calculadora/planejamento?goal=800000&monthly=3000&strategy=seguranca' },
  { label: 'R$ 150 mil entrada imóvel', sub: 'R$ 1.500/mês em 7 anos', icon: 'i-lucide-home', to: '/calculadora/planejamento?goal=150000&monthly=1500&strategy=rentabilidade' },
  { label: 'R$ 300 mil em 8 anos', sub: 'Aporte de R$ 2.000/mês', icon: 'i-lucide-rocket', to: '/calculadora/planejamento?goal=300000&monthly=2000&strategy=rentabilidade' },
  { label: 'R$ 2 milhões, perfil agressivo', sub: 'Aporte de R$ 4k/mês', icon: 'i-lucide-flame', to: '/calculadora/planejamento?goal=2000000&monthly=4000&strategy=rentabilidade' },
  { label: 'R$ 100 mil em 3 anos', sub: 'Reserva robusta R$ 2.500/mês', icon: 'i-lucide-piggy-bank', to: '/calculadora/planejamento?goal=100000&monthly=2500&strategy=seguranca' },
  { label: 'R$ 600 mil, perfil conservador', sub: 'Defensivo + renda fixa', icon: 'i-lucide-shield-check', to: '/calculadora/planejamento?goal=600000&monthly=2000&strategy=seguranca' },
  { label: 'Renda passiva R$ 5k/mês via FIIs', sub: 'Meta R$ 750k em FIIs', icon: 'i-lucide-building-2', to: '/calculadora/planejamento?goal=750000&monthly=2500&strategy=seguranca' },
  { label: 'Patrimônio R$ 1.5M aos 50', sub: 'R$ 3k/mês começando aos 30', icon: 'i-lucide-landmark', to: '/calculadora/planejamento?goal=1500000&monthly=3000&strategy=rentabilidade' },
  { label: 'FIRE em 15 anos', sub: 'R$ 1M com aporte agressivo', icon: 'i-lucide-zap', to: '/calculadora/planejamento?goal=1000000&monthly=2800&strategy=rentabilidade' },
  { label: 'Independência financeira em 25 anos', sub: 'R$ 1.5M com R$ 1.500/mês', icon: 'i-lucide-key', to: '/calculadora/planejamento?goal=1500000&monthly=1500&strategy=rentabilidade' },
] as const

// FAQs duplicados aqui pra manter a fonte unica entre o HTML
// (renderizado nos `<details>`) e o FAQPage schema (mainEntity).
// Antes o schema tinha so 3 perguntas e o HTML 11, Google ignora
// FAQs nao espelhados, perdendo rich snippet em 8 perguntas. Agora
// um array so popula os dois lados.
const faqItems = [
  {
    question: 'A carteira recomendada é garantida de funcionar?',
    answer: 'Não há garantias no mercado financeiro. A carteira é baseada em performance histórica real da B3, mas o futuro pode ser diferente. Use como ponto de partida, faça sua própria análise dos ativos e adapte conforme seu conhecimento e perfil de risco. Sempre diversifique e invista apenas o que você pode deixar investido no longo prazo.',
  },
  {
    question: 'Devo seguir a carteira exatamente como recomendada?',
    answer: 'Use como referência, não como lei absoluta. Se você já possui alguns ativos, considere-os no planejamento. Se algum ativo recomendado não te agrada ou você não conhece bem, substitua por similar do mesmo setor. O importante é manter a diversificação entre setores e não concentrar demais em poucos ativos. Os pesos podem variar ±5-10% sem grande impacto.',
  },
  {
    question: 'Com que frequência devo revisar meu planejamento?',
    answer: 'Revise seu planejamento a cada 6-12 meses, ou quando houver mudanças significativas (aumento de renda, mudança de meta, crise no mercado). Evite ficar alterando a carteira constantemente, isso gera custos e pode prejudicar o crescimento de longo prazo. Pequenas oscilações são normais e esperadas. Foque em manter a disciplina dos aportes mensais.',
  },
  {
    question: 'O que fazer se eu não conseguir atingir minha meta no prazo desejado?',
    answer: 'Você tem três opções: 1) Aumentar o aporte mensal, 2) Estender o prazo (mais tempo = mais juros compostos), 3) Reduzir a meta. Muitas vezes, aumentar o aporte em 20-30% pode encurtar o prazo em anos. Alternativamente, trabalhar mais 2-3 anos pode permitir você atingir uma meta maior. Seja realista e escolha o que cabe no seu orçamento e planos de vida.',
  },
  {
    question: 'Qual a diferença entre retorno total e CAGR?',
    answer: 'Retorno total é quanto o ativo cresceu no período todo (ex: 150% em 10 anos). CAGR (Compound Annual Growth Rate) é a taxa média anual que geraria o mesmo resultado (ex: 9,6% a.a.). CAGR é melhor para comparar ativos porque normaliza pelo tempo. Um ativo com 100% em 2 anos (41% a.a.) é melhor que 150% em 10 anos (9,6% a.a.), mesmo tendo retorno total menor.',
  },
  {
    question: 'Posso usar o planejamento para aposentadoria ou FIRE?',
    answer: 'Sim, é o uso clássico da calculadora. Para renda passiva mensal, divida a meta por 150 (regra conservadora: 0,67% a.m. = 8% a.a.). Ex: meta de R$ 1 milhão geraria cerca de R$ 6.600/mês. Se precisa de R$ 5.000/mês, sua meta é aproximadamente R$ 750 mil. Para FIRE (independência financeira antecipada), use a regra dos 25x: multiplique seu gasto anual desejado por 25. Nos últimos 5-10 anos antes da aposentadoria, migre gradualmente para estratégia de segurança.',
  },
  {
    question: 'Como o planejamento considera crises e quedas de mercado?',
    answer: 'Nosso planejamento usa dados históricos reais que incluem crises (2008, 2015-2016, 2020). Os ativos recomendados já passaram por períodos difíceis e se recuperaram. Por isso os retornos projetados são realistas, não otimistas. Crises futuras podem ser diferentes. Mantenha sempre uma reserva de emergência fora dos investimentos e não entre em pânico vendendo em quedas, historicamente, quem manteve investido se recuperou.',
  },
  {
    question: 'Preciso rebalancear a carteira periodicamente?',
    answer: 'Sim, mas não com muita frequência. A cada 6-12 meses, verifique se os pesos dos ativos ainda estão próximos do planejado. Se um ativo valorizou muito e agora representa 35% da carteira quando deveria ser 20%, venda um pouco e reforce ativos que ficaram abaixo do peso. Ou simplesmente direcione novos aportes para os ativos que estão abaixo do peso ideal. Evite rebalancear a cada mês, gera custos desnecessários.',
  },
  {
    question: 'Devo incluir imóveis no planejamento patrimonial?',
    answer: 'Imóveis físicos são ilíquidos e difíceis de precificar, então nossa calculadora não os inclui. Você pode investir em Fundos Imobiliários (FIIs), que têm liquidez, diversificação e pagam dividendos mensais. FIIs entram nas carteiras recomendadas. Se você já tem imóveis próprios, considere-os como parte do patrimônio total e foque os investimentos em ações e FIIs para diversificação.',
  },
  {
    question: 'Quanto da minha renda devo investir mensalmente?',
    answer: 'Uma regra comum é 20-30% da renda líquida, mínimo de 10%. Depende da sua situação: idade, dependentes, custo de vida, dívidas. Se você ganha R$ 5.000, investir R$ 500-1.500/mês é razoável. Comece com o que é confortável e aumente gradualmente. O mais importante é a consistência: melhor investir R$ 300/mês todo mês do que R$ 1.000 de forma irregular. Comece agora, mesmo que com pouco.',
  },
  {
    question: 'Qual a diferença entre estratégia de rentabilidade e segurança?',
    answer: 'Rentabilidade prioriza ativos com melhor performance histórica (80-90% ações + 10-20% FIIs), com retorno médio de 14-18% a.a. e maior volatilidade, ideal para horizontes de 10+ anos. Segurança mistura defensivos (50-60% bancos/energia/saneamento), 30-40% FIIs e 10% renda fixa, com retorno de 10-13% a.a. e menor oscilação, ideal para horizontes de 5-10 anos ou perfil conservador.',
  },
  {
    question: 'Como compartilhar uma simulação específica de planejamento?',
    answer: `Basta copiar a URL com os parâmetros: ${brand.url || 'https://redentia.com.br'}/calculadora/planejamento?goal=500000&monthly=1500&strategy=rentabilidade já abre a calculadora preenchida e calcula automaticamente a carteira sugerida. Útil pra mandar para o cônjuge, planejador financeiro ou salvar a meta nos favoritos.`,
  },
  {
    question: 'O que é asset allocation e por que importa?',
    answer: 'Asset allocation é a distribuição percentual da carteira entre classes de ativos (renda fixa, ações, FIIs, internacional, ouro). O estudo clássico Brinson (1986) mostra que 90% da variação de retorno de longo prazo vem da ALOCAÇÃO, não da escolha de ativos individuais. Por isso decidir "quanto em cada classe" é mais importante que "qual ação comprar". Exemplo: 60% renda variável + 40% renda fixa é moderado clássico.',
  },
  {
    question: 'Quando faz sentido fazer planejamento sucessório?',
    answer: 'Quando o patrimônio passa de R$ 500.000, você tem múltiplos herdeiros, ou conduz atividade empresarial. Instrumentos: testamento (define partilha), doação em vida com usufruto (você fica com renda enquanto vivo), holding familiar (PJ que centraliza ativos, economiza ITCMD), seguro de vida resgatável (não entra em inventário). ITCMD varia 4-8% por estado.',
  },
  {
    question: 'O que é uma holding familiar?',
    answer: 'É uma empresa (geralmente Ltda) criada pra centralizar o patrimônio da família. Vantagens: planejamento sucessório (cotas se transferem por procuração simples, sem inventário), economia de ITCMD (em alguns estados), proteção patrimonial (em casos específicos). Custos: R$ 5-15k/ano de contabilidade + ITBI/ITCMD na transferência inicial. Só vale a pena pra patrimônio acima de R$ 1 milhão.',
  },
  {
    question: 'Qual a diferença entre planejamento patrimonial e financeiro?',
    answer: 'Planejamento financeiro foca no curto-médio prazo (orçamento, dívidas, reserva de emergência, primeiros investimentos). Planejamento patrimonial é mais amplo: estratégia de longo prazo pra construir e GERIR um patrimônio relevante (asset allocation, diversificação, sucessão). Toda pessoa deveria ter um planejamento financeiro; planejamento patrimonial vira relevante a partir de R$ 200-500k em ativos.',
  },
] as const

const pageTitle = `Planejamento Patrimonial 2026 - Carteira B3 | ${brand.name}`
const pageDescription =
  'Carteira recomendada da B3 pra atingir R$ 500 mil, R$ 1 milhão ou liberdade financeira. Asset allocation por perfil + planejamento sucessório. Grátis.'

usePageSeo({
  title: pageTitle,
  description: pageDescription,
  path: '/calculadora/planejamento',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Planejamento Patrimonial', path: '/calculadora/planejamento' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `Calculadora de Planejamento Patrimonial ${brand.name}`,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Planejamento patrimonial',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      dateModified: lastUpdatedISO,
      description:
        'Calculadora gratuita de planejamento patrimonial com carteira sugerida (pesos por ativo) baseada em dados históricos reais da B3. Calcula tempo até a meta, aportes totais, ganho projetado e compara com performance histórica.',
      featureList: [
        'Cálculo de tempo para atingir metas financeiras',
        'Carteira sugerida com pesos por ativo',
        'Estratégias de maior rentabilidade e maior segurança',
        'Dados históricos reais de centenas de ativos da B3',
        'Projeção mês a mês do patrimônio',
        'Comparação com performance histórica',
        'Rentabilidade média mensal esperada',
        'CAGR e dividendos reinvestidos por ativo',
        'Deep-link compartilhável com inputs pré-preenchidos',
        'Cenários populares 1 clique (FIRE, aposentadoria, imóvel)',
      ],
      about: [
        { '@type': 'Organization', name: 'B3', url: 'https://www.b3.com.br' },
        { '@type': 'Organization', name: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br' },
        { '@type': 'Organization', name: 'CVM', url: 'https://www.gov.br/cvm' },
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

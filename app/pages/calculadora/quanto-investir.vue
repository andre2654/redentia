<template>
  <NuxtLayout name="default" title="Calculadora: Quanto Investir por Mês">
    <section class="flex flex-col gap-8 px-6 py-8">
      <MoleculesPageHeader
        :back-link="{ to: '/calculadora', label: 'Todas as calculadoras' }"
        icon="i-lucide-wallet"
        icon-color="secondary"
        title="Calculadora 2026: Quanto Investir por Mês para Sua Meta Financeira"
        description="Esta calculadora descobre quanto você precisa investir por mês para atingir uma meta financeira específica. Usa a fórmula do valor presente de uma série de pagamentos, considerando taxa de juros e prazo. Exemplo: pra juntar R$ 500.000 em 10 anos a 10% ao ano, você precisa aportar cerca de R$ 2.412 por mês, totalizando R$ 289.440 investidos e R$ 210.560 em juros."
        :chips="[
          { icon: 'i-lucide-check-circle', label: '100% gratuito', color: 'positive' },
          { icon: 'i-lucide-zap', label: 'Cálculo instantâneo', color: 'primary' },
          { icon: 'i-lucide-target', label: 'Cálculo reverso por meta', color: 'primary' },
          { icon: 'i-lucide-share-2', label: 'Link compartilhável', color: 'primary' },
        ]"
        :meta="`Última atualização: ${ lastUpdatedText }`"
      />

      <p class="text-base md:text-lg" :style="{ color: 'var(--brand-text-muted)' }">
        Descubra na hora quanto você precisa aportar mensalmente pra ter R$ 100 mil, R$ 500 mil ou R$ 1 milhão em 5, 10, 15 ou 20 anos. Calculadora reversa de juros compostos, considera patrimônio inicial, taxa de retorno realista e ajuste pela inflação. Gratuito, sem cadastro, sem planilha.
      </p>

      <!-- Calculadora -->
      <CalculatorMonthlyInvestment />

      <!-- Cenarios populares (internal linking + deep-links) -->
      <!--
        Cada link e uma "landing page virtual" que o Google indexa
        independente. MonthlyInvestment.vue le `?goal=`, `?years=`,
        `?wealth=`, `?rate=` e ja dispara o calculo no mount. Padrao
        identico ao da juros-compostos, adaptado pra long-tails de
        meta ("quanto investir pra ter 1 milhao em 20 anos", "como
        juntar 500 mil em 10 anos", "aporte mensal pra entrada do
        imovel", etc).
      -->
      <div
        class="flex flex-col gap-3 rounded-lg border p-6"
        :style="{
          backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
          borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
        }"
      >
        <h2>Cenários populares de meta financeira</h2>
        <p class="text-sm">
          Veja na hora o aporte mensal necessário para cada meta, basta clicar e a simulação carrega já preenchida.
        </p>
        <div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          <NuxtLink
            v-for="s in popularScenarios"
            :key="s.label"
            :to="s.to"
            class="group flex flex-col gap-0.5 rounded-xl border px-3 py-3 transition hover:border-secondary/40 hover:bg-secondary/10"
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
      <div class="quiet-prose max-w-none">
        <h2>Simulador de Aporte Mensal grátis e online</h2>
        <h2>Como Calcular Quanto Investir por Mês</h2>
        <p class="leading-relaxed">
          A maioria das calculadoras te pergunta "quanto você vai investir" e mostra "quanto vai ter". Esta faz o caminho inverso: você define sua meta (R$ 500 mil, R$ 1 milhão, entrada de imóvel) e o prazo, e a calculadora descobre exatamente quanto precisa aportar todo mês para chegar lá.
        </p>
        <p class="leading-relaxed">
          O cálculo usa a fórmula de anuidade dos juros compostos invertida, considerando seu patrimônio atual, a taxa de retorno esperada e, opcionalmente, o ajuste dos aportes pela inflação para preservar o poder de compra ao longo do tempo.
        </p>

        <h3>Por que Calcular Quanto Investir Faz Diferença</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              Meta tangível, não abstrata
            </h4>
            <p class="text-sm">
              Saber "preciso de R$ 1.288/mês para ter R$ 100k em 5 anos" cria um número concreto pra defender no orçamento. Meta sem aporte definido vira intenção esquecida.
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
              Comparação de cenários
            </h4>
            <p class="text-sm">
              Esticar o prazo em 5 anos pode reduzir o aporte mensal pela metade. Trocar a taxa de 8% para 12% também. Ver o trade-off lado a lado evita decisões cegas.
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
              Sanidade financeira
            </h4>
            <p class="text-sm">
              Se o aporte calculado é maior que sua renda inteira, você sabe na hora que precisa estender prazo, reduzir meta ou aumentar renda. Reality check em 30 segundos.
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
              Aproveita seu patrimônio atual
            </h4>
            <p class="text-sm">
              Já tem R$ 50 mil parado? Eles entram no cálculo e reduzem o aporte mensal exigido. A calculadora compõe juros sobre o que você já tem mais os novos aportes.
            </p>
          </div>
        </div>

        <h2>Educação Financeira Aplicada</h2>
        <p class="leading-relaxed">
          Educação financeira é o ponto de partida do planejamento financeiro pessoal. Antes de saber quanto investir, é preciso entender 3 coisas: orçamento (regra 50/30/20 ou método dos 4 envelopes), reserva de emergência (6-12 meses de despesas em renda fixa líquida) e perfil de risco (conservador, moderado, arrojado). Sem esses três alicerces, qualquer aporte vira aposta. Com eles, o aporte vira plano e a meta vira rotina.
        </p>

        <h2>Reserva de Emergência: Antes de Tudo</h2>
        <p class="leading-relaxed">
          Antes de aportar em metas de longo prazo, monte a reserva de emergência. Ela é o colchão financeiro que protege seu plano de imprevistos (desemprego, problema de saúde, conserto urgente) e impede que você venda investimentos de longo prazo em momentos ruins, cristalizando perdas.
        </p>
        <ul class="list-disc pl-6 text-sm leading-relaxed">
          <li><strong>Quanto:</strong> 6 a 12 meses de despesas mensais. Se você gasta R$ 4.000/mês, a reserva ideal fica entre R$ 24.000 e R$ 48.000.</li>
          <li><strong>Onde:</strong> Tesouro Selic 2030 (zero risco de crédito, liquidez diária), CDB de banco grande com liquidez diária (~CDI, com cobertura do FGC até R$ 250 mil) ou conta remunerada (Nubank, Inter, C6 Bank rendendo ~100% do CDI).</li>
          <li><strong>Por quê:</strong> em uma emergência, vender ações ou FIIs em queda transforma perda contábil em perda real. Reserva líquida elimina esse risco.</li>
          <li><strong>Exemplo prático:</strong> família com R$ 4.000 de gasto mensal precisa de R$ 24.000 a R$ 48.000 em renda fixa de liquidez diária antes de começar a alocar em renda variável.</li>
        </ul>

        <h2>Onde Investir o Aporte Mensal</h2>
        <p class="leading-relaxed">
          Calcular o aporte é metade do trabalho. A outra metade é decidir onde alocar o dinheiro todo mês. A escolha depende do seu perfil de risco e do horizonte da meta. Veja a sugestão de carteira por perfil:
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
              100% renda fixa pura. Tesouro Selic 2030 (rentabilidade ~Selic, liquidez diária), CDB de bancões com liquidez diária (~CDI), LCI/LCA (isentas de IR, prazo médio 90-720 dias).
            </p>
            <p class="mt-2 text-xs" :style="{ color: 'var(--brand-text-muted)' }">
              Risco baixo, retorno esperado 10-13% a.a.
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
              60% renda fixa (Tesouro IPCA+ 2035, CDBs longos, fundos DI) + 30% FIIs (HGLG11, KNCR11) + 10% ações blue chip (ITUB4, ITSA4).
            </p>
            <p class="mt-2 text-xs" :style="{ color: 'var(--brand-text-muted)' }">
              Risco médio, retorno esperado 10-12% a.a.
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
              70% renda variável (ações, FIIs e ETFs como BOVA11) + 30% renda fixa para a reserva e oportunidades. Foco em horizonte de 10+ anos.
            </p>
            <p class="mt-2 text-xs" :style="{ color: 'var(--brand-text-muted)' }">
              Risco alto, retorno histórico 12-15% a.a. com volatilidade.
            </p>
          </div>
        </div>

        <h2>Comparar CDB e Tesouro Direto</h2>
        <p class="leading-relaxed">
          As duas alternativas mais usadas pra renda fixa no Brasil são Tesouro Direto (títulos do governo) e CDB (Certificado de Depósito Bancário emitido por bancos). Veja as diferenças que importam pra sua decisão:
        </p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
            >
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Critério</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Tesouro Direto</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">CDB</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Risco</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Tesouro Nacional (menor risco do Brasil)</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Banco emissor + FGC até R$ 250k por CPF/instituição</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Rentabilidade</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Selic, IPCA+, Prefixado</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Geralmente CDI (90-120%)</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Imposto de Renda</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">22,5% até 180 dias, regressiva até 15% após 720 dias</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Mesma tabela regressiva (22,5% a 15%)</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Liquidez</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Diária no Tesouro Selic, demais via venda no mercado secundário</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Variável (alguns têm liquidez diária, outros vencimento fixo)</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Aporte mínimo</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">A partir de R$ 30</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Geralmente R$ 100 ou mais</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm">
          Conclusão prática: pra reserva de emergência, Tesouro Selic costuma ser a opção mais simples e barata. Pra prazos mais longos, CDB de bancões médios pode pagar 110-120% do CDI, batendo o Tesouro Selic mesmo descontando o IR. Diversificar entre os dois faz sentido em carteiras maiores, e LCI/LCA podem complementar pra aportes específicos por serem isentas de IR pra pessoa física.
        </p>

        <h2>Fórmula do Aporte Mensal Necessário</h2>
        <p class="leading-relaxed">
          A matemática por trás do cálculo é a fórmula de anuidade dos juros compostos invertida para isolar o aporte (PMT):
        </p>
        <div class="brand-card border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg">
            PMT = (FV − PV × (1 + i)ⁿ) ÷ [((1 + i)ⁿ − 1) ÷ i]
          </p>
          <div class="mt-4 space-y-2 text-sm">
            <p><strong>PMT</strong> = Aporte mensal necessário</p>
            <p><strong>FV</strong> = Valor futuro (sua meta)</p>
            <p><strong>PV</strong> = Valor presente (patrimônio atual)</p>
            <p><strong>i</strong> = Taxa mensal de retorno (taxa anual ÷ 12)</p>
            <p><strong>n</strong> = Número de meses (anos × 12)</p>
          </div>
        </div>

        <h2>Tabela de Aporte Mensal por Meta e Prazo (Taxa 10% a.a.)</h2>
        <p class="leading-relaxed">
          A referência rápida para metas comuns considerando 10% a.a. de retorno (próximo da média histórica do CDI somado a uma fatia de bolsa):
        </p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
            >
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Meta</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">5 anos</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">10 anos</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">15 anos</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">20 anos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 100 mil</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 1.288</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 482</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 240</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 132</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 500 mil</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 6.440</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 2.412</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 1.202</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 661</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 1 milhão</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 12.880</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 4.825</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 2.404</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 1.321</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 2 milhões</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 25.760</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 9.650</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 4.808</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 2.642</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm">
          Note como dobrar o prazo reduz o aporte em mais de 50%. Esticar de 10 para 20 anos para a meta de R$ 500 mil reduz o aporte de R$ 2.412 para R$ 661, uma economia de quase R$ 1.800/mês.
        </p>

        <h2>Quanto Investir para Cada Tipo de Meta</h2>

        <h3>Reserva de Emergência</h3>
        <p class="leading-relaxed">
          Meta: 3 a 12 meses de despesas. Para alguém com R$ 5 mil de gasto mensal, a reserva ideal é R$ 30 mil a R$ 60 mil. Por ser dinheiro de curto prazo, a calculadora costuma indicar aportes mais agressivos (R$ 800 a R$ 1.500/mês) em horizonte de 1 a 2 anos, em CDB de liquidez diária ou Tesouro Selic.
        </p>

        <h3>Entrada de Imóvel</h3>
        <p class="leading-relaxed">
          Meta típica: R$ 80 mil a R$ 200 mil em 3 a 5 anos. A 10% a.a., R$ 100 mil em 3 anos exigem cerca de R$ 2.400/mês. Em 5 anos, cai para R$ 1.288/mês. Se você não tem pressa, esticar o prazo em 2 anos quase dobra o tempo até a chave, mas reduz drasticamente o sacrifício mensal.
        </p>

        <h3>Independência Financeira</h3>
        <p class="leading-relaxed">
          Meta: 25× a despesa anual (regra dos 4%). Para uma pessoa que gasta R$ 8 mil/mês (R$ 96 mil/ano), o número mágico é R$ 2,4 milhões. Em 25 anos com 10% a.a., isso exige R$ 1.819/mês de aporte. Em 30 anos, cai para R$ 1.063/mês. Cada década adicionada divide o esforço quase pela metade.
        </p>

        <h3>Aposentadoria com R$ 800 mil</h3>
        <p class="leading-relaxed">
          Meta clássica de classe média brasileira: aposentar com R$ 800 mil para complementar INSS. Em 25 anos, demanda R$ 606/mês a 10% a.a. Em 20 anos, R$ 1.058/mês. Use a <NuxtLink to="/calculadora/aposentadoria" class="text-secondary underline hover:opacity-80">calculadora de aposentadoria</NuxtLink> pra incluir INSS, expectativa de vida e regra dos 4% com mais detalhe.
        </p>

        <h2>Quanto da Renda Devo Investir?</h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
            >
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Perfil</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">% da renda</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Renda R$ 5 mil</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Patrimônio em 20 anos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Mínimo viável</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">10%</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 500</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 379 mil</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Recomendado (50/30/20)</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">20%</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 1.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 758 mil</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Acelerado</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">30%</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 1.500</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 1,1 milhão</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">FIRE agressivo</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">50%+</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 2.500+</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 1,9 milhão+</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Como Usar a Calculadora de Aporte Mensal</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              1
            </div>
            <div>
              <h4>Defina sua Meta Financeira</h4>
              <p class="text-sm">
                Quanto você quer ter ao final do prazo. Pode ser R$ 100 mil pra entrada de imóvel, R$ 1 milhão pra independência ou qualquer valor que faça sentido pro seu projeto de vida.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              2
            </div>
            <div>
              <h4>Defina o Prazo em Anos</h4>
              <p class="text-sm">
                Em quanto tempo você quer atingir a meta. Lembre que esticar o prazo reduz drasticamente o aporte exigido por causa do efeito exponencial dos juros compostos.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              3
            </div>
            <div>
              <h4>Escolha a Taxa de Retorno</h4>
              <p class="text-sm">
                Use uma taxa realista. Renda fixa: 10-13% a.a. Carteira diversificada: 10-12% a.a. Bolsa pura: 12-15% a.a. (com volatilidade). Para metas de curto prazo, prefira taxas conservadoras.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              4
            </div>
            <div>
              <h4>Veja o Aporte Necessário</h4>
              <p class="text-sm">
                A calculadora retorna o valor exato que você precisa investir todo mês, mais a tabela de sensibilidade por taxa e os cenários alternativos (aumentar ou reduzir aporte, esticar prazo).
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              5
            </div>
            <div>
              <h4>Ajuste o Plano</h4>
              <p class="text-sm">
                Se o aporte não couber no orçamento, estenda o prazo, reduza a meta ou busque investimentos com maior retorno. Reaplique até encontrar a combinação realista.
              </p>
            </div>
          </div>
        </div>

        <h2>Quanto Investir por Idade</h2>
        <p class="leading-relaxed">
          O aporte ideal varia ao longo da vida. Quanto antes começar, menor o esforço mensal exigido pra alcançar metas relevantes. Veja a referência por faixa etária:
        </p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
            >
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Idade</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Aporte Sugerido</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">% da Renda</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Meta Realista</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">20-25 anos</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 200 a R$ 500/mês</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">10-15%</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Reserva de emergência + começar Tesouro</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">26-35 anos</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 500 a R$ 1.500/mês</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">15-25%</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 100k a R$ 300k em 10 anos</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">36-45 anos</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 1.500 a R$ 3.000/mês</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">20-30%</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 500k a R$ 1M em 15 anos</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">46-55 anos</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 3.000 a R$ 5.000/mês</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">25-35%</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 1M a R$ 2M até a aposentadoria</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">56+ anos</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Maximize</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Migra pra renda fixa segura</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Preservação + renda</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm">
          O princípio é simples: quem começa cedo precisa investir menos por mês porque os juros compostos trabalham por mais tempo. Dos 20 aos 35 anos o foco é construir hábito e reserva. Dos 35 aos 55 é a década de maior acúmulo, quando renda profissional costuma estar no pico. Acima dos 56, prioridade muda pra preservação do patrimônio e geração de renda recorrente, reduzindo gradualmente a renda variável.
        </p>

        <MoleculesFAQ
          title="Perguntas Frequentes sobre Aporte Mensal"
          :items="faqItems"
        />

        <h2>Dicas para Cumprir o Aporte Mensal Calculado</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              1. Automatize o Aporte
            </h4>
            <p class="text-sm">
              Configure transferência automática no dia do salário. Investir o que sobra raramente funciona, investir antes de gastar funciona quase sempre.
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
              2. Aumente o Aporte com Aumento de Renda
            </h4>
            <p class="text-sm">
              Sempre que ganhar 10% a mais de salário, aumente o aporte em 10%. Mantém seu padrão de vida estável e acelera a meta sem esforço.
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
              3. Direcione o 13º e Bônus
            </h4>
            <p class="text-sm">
              13º, PLR, restituição de IR, herança, todo dinheiro extra que entra fora do salário deve ir direto pra meta. Em 10 anos, isso reduz o aporte mensal em 15-25%.
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
              4. Acompanhe Mês a Mês
            </h4>
            <p class="text-sm">
              Compare patrimônio real com a projeção a cada 6 meses. Se ficou abaixo, ajuste antes de virar bola de neve. Se ficou acima, ótimo, mas não relaxe nos aportes.
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
              5. Não Se Sabote
            </h4>
            <p class="text-sm">
              Saque de meta de longo prazo pra cobrir gasto de curto prazo é o erro mais comum. Tenha reserva de emergência separada da meta para não tocar nos investimentos de longo prazo.
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
              6. Revise a Meta a Cada 2 Anos
            </h4>
            <p class="text-sm">
              Inflação, mudanças de vida e novos objetivos exigem revisão periódica. R$ 1 milhão hoje não é a mesma coisa que R$ 1 milhão daqui a 15 anos.
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
        <div class="grid gap-4 md:grid-cols-2">
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
        <h2>Outras Calculadoras</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/juros-compostos"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <UIcon name="i-lucide-trending-up" class="text-secondary size-8 shrink-0" />
            <div>
              <h3>Juros Compostos</h3>
              <p class="text-sm">Simule quanto vai ter no futuro</p>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/calculadora/aposentadoria"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <UIcon name="i-lucide-piggy-bank" class="text-secondary size-8 shrink-0" />
            <div>
              <h3>Aposentadoria</h3>
              <p class="text-sm">Planeje sua aposentadoria com regra dos 4%</p>
            </div>
          </NuxtLink>
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
          <UIcon name="i-lucide-book-open-check" class="size-7 text-secondary" />
        </div>
        <div class="flex flex-col gap-1 text-sm">
          <p>
            Metodologia revisada pela equipe de análise da {{ brand.name }}
          </p>
          <p>
            Cálculos baseados na fórmula de anuidade dos juros compostos invertida (PMT = (FV − PV(1+i)ⁿ) ÷ [((1+i)ⁿ − 1)÷i]) e em médias históricas do mercado brasileiro (CDI, Ibovespa, IPCA). Resultados assumem aportes mensais constantes e capitalização mensal dos rendimentos.
          </p>
          <p class="text-xs">
            Fontes: <a href="https://www.bcb.gov.br" target="_blank" rel="noopener nofollow" class="underline hover:text-secondary">Banco Central do Brasil</a>,
            <a href="https://www.b3.com.br" target="_blank" rel="noopener nofollow" class="underline hover:text-secondary">B3 (Brasil, Bolsa, Balcão)</a>,
            <a href="https://www.ibge.gov.br" target="_blank" rel="noopener nofollow" class="underline hover:text-secondary">IBGE</a>.
          </p>
        </div>
      </aside>

      <!-- CTA -->
      <MoleculesCtaSection
        :title="`Acompanhe suas metas na ${brand.name}`"
        description="Monitore o progresso das suas metas financeiras com gráficos e análises em tempo real."
        :buttons="[
          { label: 'Criar conta grátis', to: '/auth/register', icon: 'i-lucide-arrow-right', variant: 'primary' },
          { label: 'Ver mais calculadoras', to: '/calculadora', variant: 'outline' },
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

// Rankings relacionados — pontes pra blue chips e carteiras
// Buy and Hold, naturais pra quem ja descobriu quanto investir.
const relatedRankings = [
  {
    to: '/ranking/maiores-valor-mercado',
    icon: 'i-lucide-landmark',
    title: 'Blue chips por valor de mercado',
    sub: 'Maiores empresas listadas na B3',
  },
  {
    to: '/ranking/buy-and-hold',
    icon: 'i-lucide-shield-check',
    title: 'Carteira Buy and Hold',
    sub: 'Score Redent pra horizonte longo',
  },
] as const

// Data de atualização dinâmica: 1º dia do mês corrente. Google usa
// dateModified como sinal de frescor; atualizar mensalmente mantém a página
// "fresca" sem trabalho manual.
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const lastUpdatedISO = lastUpdated.toISOString().slice(0, 10)

// ====================================================================
// Cenarios populares — long-tail SEO via deep-links.
// Cada cenario combina meta+prazo+taxa+wealth em uma URL canonica que
// MonthlyInvestment.vue ja le no mount (via parseNumberParam) e dispara
// o calculo automaticamente. Long-tails miradas:
// "quanto investir por mes pra ter X", "como juntar 1 milhao em 20 anos",
// "aporte mensal entrada imovel", "investir pra aposentadoria 25 anos".
// ====================================================================
const popularScenarios = [
  { label: 'R$ 100 mil em 5 anos', sub: 'Curto prazo, meta concreta', icon: 'i-lucide-target', to: '/calculadora/quanto-investir?goal=100000&years=5&rate=10' },
  { label: 'R$ 500 mil em 10 anos', sub: 'Cenário clássico', icon: 'i-lucide-trending-up', to: '/calculadora/quanto-investir?goal=500000&years=10&rate=10' },
  { label: 'R$ 1 milhão em 15 anos', sub: 'Médio prazo agressivo', icon: 'i-lucide-rocket', to: '/calculadora/quanto-investir?goal=1000000&years=15&rate=10' },
  { label: 'R$ 1 milhão em 20 anos', sub: 'Plano consistente', icon: 'i-lucide-trophy', to: '/calculadora/quanto-investir?goal=1000000&years=20&rate=10' },
  { label: 'R$ 2 milhões em 20 anos', sub: 'Patrimônio expressivo', icon: 'i-lucide-gem', to: '/calculadora/quanto-investir?goal=2000000&years=20&rate=10' },
  { label: 'Aposentadoria R$ 800 mil 25 anos', sub: 'Complemento INSS', icon: 'i-lucide-armchair', to: '/calculadora/quanto-investir?goal=800000&years=25&rate=10' },
  { label: 'Liberdade R$ 3 milhões 30 anos', sub: 'FIRE clássico', icon: 'i-lucide-sun', to: '/calculadora/quanto-investir?goal=3000000&years=30&rate=11' },
  { label: 'Entrada imóvel R$ 100 mil 3 anos', sub: 'Sonho da casa própria', icon: 'i-lucide-home', to: '/calculadora/quanto-investir?goal=100000&years=3&rate=12' },
  { label: 'Carro R$ 80 mil 4 anos', sub: 'Sem financiamento', icon: 'i-lucide-car', to: '/calculadora/quanto-investir?goal=80000&years=4&rate=12' },
  { label: 'Faculdade filhos R$ 200 mil 15 anos', sub: 'Educação dos filhos', icon: 'i-lucide-graduation-cap', to: '/calculadora/quanto-investir?goal=200000&years=15&rate=10' },
  { label: 'Casamento R$ 50 mil 2 anos', sub: 'Curto prazo', icon: 'i-lucide-heart', to: '/calculadora/quanto-investir?goal=50000&years=2&rate=12' },
  { label: 'Reserva R$ 30 mil 1 ano', sub: 'Emergência líquida', icon: 'i-lucide-life-buoy', to: '/calculadora/quanto-investir?goal=30000&years=1&rate=12' },
  { label: 'Aposentar aos 60 com R$ 1M', sub: 'Aposentadoria tranquila', icon: 'i-lucide-armchair', to: '/calculadora/quanto-investir?goal=1000000&years=30&rate=10' },
  { label: 'Educação dos filhos R$ 200k em 15 anos', sub: 'Faculdade dos filhos', icon: 'i-lucide-graduation-cap', to: '/calculadora/quanto-investir?goal=200000&years=15&rate=10' },
] as const

// FAQs duplicados aqui pra manter a fonte unica entre o HTML
// (renderizado nos `<details>`) e o FAQPage schema (mainEntity).
const faqItems = [
  {
    question: 'Quanto da minha renda devo investir por mês?',
    answer: 'Regra 50/30/20: 50% necessidades, 30% desejos, 20% investimentos. Mínimo defensável é 10% da renda. Ideal é 20-30% para classe média construir patrimônio relevante. Quem busca FIRE (independência financeira antecipada) precisa chegar a 50-70% da renda. Se ganha R$ 5.000: investir R$ 500 (mínimo) a R$ 1.500 (ideal). Aumente o percentual conforme sua renda cresce.',
  },
  {
    question: 'E se eu não conseguir investir o valor calculado pela calculadora?',
    answer: 'Você tem 4 opções práticas: 1) Estender o prazo (mais tempo reduz drasticamente o aporte por causa dos juros compostos), 2) Reduzir a meta para algo mais realista, 3) Buscar investimentos com maior retorno (e mais risco), 4) Aumentar a renda com side hustles ou negociação salarial. Comece com o que conseguir, é melhor investir R$ 300/mês por 15 anos do que esperar "ter condições" pra investir R$ 1.000. O tempo perdido não volta.',
  },
  {
    question: 'Como o patrimônio atual influencia o aporte necessário?',
    answer: 'O patrimônio que você já tem entra na fórmula como valor presente (PV) e é multiplicado pelos juros compostos durante o prazo. Quanto mais alto, menor o aporte mensal exigido. Exemplo: R$ 1 milhão em 20 anos a 10% a.a. exige R$ 1.321/mês começando do zero. Com R$ 50 mil já investidos, cai para R$ 853/mês. Com R$ 100 mil, cai para R$ 386/mês. Por isso quem começa cedo e nunca para tem vantagem desproporcional.',
  },
  {
    question: 'Qual a diferença entre meta nominal e meta ajustada pela inflação?',
    answer: 'Meta nominal é o valor absoluto de R$ no futuro (ex: "quero R$ 1 milhão em 2046"). Meta ajustada pela inflação é o equivalente do poder de compra de hoje (ex: "quero conseguir comprar hoje o que R$ 1 milhão compra agora"). Para metas de longo prazo (20+ anos), sempre pense em ajustar pela inflação, R$ 1 milhão em 30 anos pode comprar o equivalente a R$ 300 mil hoje, dependendo da inflação acumulada.',
  },
  {
    question: 'Posso aumentar o aporte ao longo do tempo?',
    answer: 'Sim, e é altamente recomendado. A calculadora padrão assume aporte fixo, mas a vida real envolve aumento de renda. Aumentar o aporte em 5% ao ano (acompanhando inflação + crescimento salarial) reduz o esforço inicial e ainda garante a meta. Estratégia prática: aumente o aporte na mesma proporção do seu aumento salarial. Se ganhou 10% a mais, invista 10% a mais.',
  },
  {
    question: 'Devo investir o 13º salário e bônus na meta?',
    answer: 'Sim, sempre que possível. Aportes extras esporádicos (13º, PLR, restituição de IR, presentes) têm efeito desproporcional porque ficam aplicados o resto do prazo, ganhando juros compostos sobre tudo. Direcionar o 13º inteiro pra meta durante 20 anos pode reduzir o aporte mensal em 15-25%. Trate dinheiro extra como acelerador, não como diversão.',
  },
  {
    question: 'Qual taxa de retorno usar no cálculo?',
    answer: 'Depende do produto e prazo: Tesouro Selic e CDBs líquidos pagam ~CDI (12-13% a.a. em 2026). Tesouro IPCA+ paga IPCA + 6% a.a. (~10-12% nominal). Carteira diversificada (60% renda variável + 40% renda fixa) tende a 10-12% a.a. no longo prazo. Bolsa pura entrega 12-15% historicamente, mas com volatilidade alta. Para metas de curto prazo (até 3 anos), use 10% a.a. conservador. Para longo prazo (10+ anos) com renda variável, 11-12% a.a. é razoável.',
  },
  {
    question: 'Como esticar o prazo afeta o aporte mensal?',
    answer: 'O efeito é exponencial e gigante. Para juntar R$ 1 milhão a 10% a.a.: em 10 anos o aporte é R$ 4.825/mês, em 15 anos cai pra R$ 2.404/mês (50% menos), em 20 anos cai pra R$ 1.321/mês (73% menos), em 30 anos cai pra R$ 442/mês (91% menos). Cada década adicional reduz o aporte em ~50%. Se você tem flexibilidade no prazo, esticar é o caminho mais barato pra qualquer meta.',
  },
  {
    question: 'Vale a pena começar com aporte pequeno?',
    answer: 'Sim, sempre. Os primeiros R$ 100 ou R$ 200/mês criam o hábito, que é o mais importante. Em 5 anos você terá R$ 7.000-15.000 acumulados, o que já parece patrimônio de verdade e cria disciplina pra aumentar o aporte com tempo. Quem espera "ter condições" pra investir valor "que vale a pena" geralmente nunca começa. Aporte pequeno feito hoje supera aporte grande feito daqui a 5 anos.',
  },
  {
    question: 'Como a inflação corrói o valor da minha meta no futuro?',
    answer: 'Com inflação de 4-5% a.a. (média histórica brasileira), R$ 1 milhão daqui a 20 anos vale aproximadamente R$ 380 mil em poder de compra de hoje. Em 30 anos, vale ~R$ 230 mil. Por isso, para metas de longo prazo, mire em valor inflado: se você quer "viver com R$ 5 mil/mês de hoje" daqui a 25 anos, precisa de R$ 12-15 mil/mês nominais, o que muda o tamanho da meta total.',
  },
  {
    question: 'Como compartilhar uma simulação específica desta calculadora?',
    answer: `Basta copiar a URL com os parâmetros: ${brand.url || 'https://redentia.com.br'}/calculadora/quanto-investir?goal=1000000&years=20&rate=10 já abre a calculadora preenchida e calcula automaticamente. Útil pra mandar para o cônjuge, planejador financeiro ou salvar a meta nos favoritos do navegador.`,
  },
  {
    question: 'Quanto investir aos 30 anos?',
    answer: 'Aos 30 anos, o ideal é investir 20-25% da renda mensal. Quem ganha R$ 5.000 deveria aportar R$ 1.000-1.250/mês. A 10% a.a. ao longo de 30 anos, isso vira R$ 2,3-2,9 milhões. Antes de investir, garanta reserva de emergência (6-12 meses de despesas) em Tesouro Selic ou CDB com liquidez diária.',
  },
  {
    question: 'Qual a diferença entre renda fixa e renda variável?',
    answer: 'Renda fixa tem rentabilidade contratada (Tesouro, CDB, LCI/LCA, fundos DI). O retorno é previsível, baixo risco, ideal pra reserva e curto prazo. Renda variável (ações, FIIs, ETFs) tem retorno incerto, maior risco, maior potencial. Carteira balanceada combina ambos: % de renda fixa = idade (30 anos = 30% RF, 60 anos = 60% RF) é uma regra clássica.',
  },
  {
    question: 'Onde investir o aporte mensal?',
    answer: 'Depende do perfil. Conservador: 100% renda fixa (Tesouro Selic, CDB liquidez diária, LCI/LCA). Moderado: 60% renda fixa + 30% FIIs + 10% ações. Arrojado: 70% renda variável + 30% renda fixa. Para todos: comece com a reserva de emergência em Tesouro Selic, depois alocação por perfil.',
  },
  {
    question: 'Posso usar a mesma carteira a vida toda?',
    answer: 'Não. A regra geral é diminuir gradualmente a renda variável conforme se aproxima dos objetivos. Aos 25-35 anos, 70-80% renda variável. 35-50 anos, 50-60% renda variável. 50+ anos, 30-40% renda variável. Próximo do uso (1-2 anos), migre tudo pra renda fixa segura pra evitar perdas em crises.',
  },
] as const

const pageTitle = `Calculadora: Quanto Investir por Mês 2026 - Grátis | ${brand.name}`
const pageDescription =
  'Descubra quanto investir por mês para juntar R$ 100 mil, R$ 500 mil ou R$ 1 milhão. Tesouro Direto, CDB, LCI/LCA por perfil. Grátis, sem cadastro.'

usePageSeo({
  title: pageTitle,
  description: pageDescription,
  path: '/calculadora/quanto-investir',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Quanto Investir', path: '/calculadora/quanto-investir' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `Calculadora de Aporte Mensal ${brand.name}`,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Planejamento financeiro',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      dateModified: lastUpdatedISO,
      description:
        'Calculadora gratuita que descobre o aporte mensal necessário pra atingir uma meta financeira em determinado prazo. Considera patrimônio inicial, taxa de retorno, ajuste pela inflação e cenários alternativos (esticar prazo, alterar aporte). Deep-link compartilhável com inputs pré-preenchidos.',
      featureList: [
        'Cálculo reverso de aporte mensal por meta financeira',
        'Considera patrimônio inicial e ajuste pela inflação',
        'Tabela de sensibilidade por taxa de retorno',
        'Cenários alternativos (aumentar 20%, reduzir 20%, esticar prazo)',
        'Composição patrimônio: aportes vs juros compostos',
        'Suporta metas de R$ 30 mil a R$ 10 milhões',
        'Deep-link compartilhável com inputs pré-preenchidos',
        'Cenários populares 1 clique (R$ 500 mil em 10 anos, R$ 1 milhão em 20 anos, etc.)',
        'Cálculo de viabilidade em tempo real',
        'Pt-BR com formatação brasileira',
      ],
      about: [
        { '@type': 'Organization', name: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br' },
        { '@type': 'Organization', name: 'B3', url: 'https://www.b3.com.br' },
        { '@type': 'Organization', name: 'IBGE', url: 'https://www.ibge.gov.br' },
        { '@type': 'Organization', name: 'CVM', url: 'https://www.gov.br/cvm' },
        { '@type': 'Organization', name: 'Receita Federal', url: 'https://www.gov.br/receitafederal' },
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

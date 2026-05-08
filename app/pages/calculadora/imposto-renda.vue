<template>
  <NuxtLayout name="default" title="Calculadora de IR sobre Ações">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Back-link to parent listing -->
      <NuxtLink
        to="/calculadora"
        class="flex items-center gap-1 text-xs transition hover:opacity-80"
        :style="{ color: 'var(--brand-text-muted)' }"
      >
        <UIcon name="i-lucide-chevron-left" class="size-3" />
        Todas as calculadoras
      </NuxtLink>

      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-receipt-text" class="text-secondary h-8 w-8" />
          <h1
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(28px, 4vw, 36px)',
              lineHeight: 1.05,
              letterSpacing: '-0.7px',
            }"
          >Calculadora de IR sobre Ações 2026: Day Trade, Swing Trade e DARF</h1>
        </div>
        <p class="text-base md:text-lg" :style="{ color: 'var(--brand-text)' }">
          O IR sobre ações no Brasil é 15% (swing trade) ou 20% (day trade) sobre o lucro mensal. Vendas até R$ 20.000/mês em swing trade são isentas. Exemplo: vendeu R$ 25.000 com R$ 3.000 de lucro? Paga 15% × R$ 3.000 = R$ 450 via DARF código 6015 até o último dia útil do mês seguinte.
        </p>
        <p class="text-base md:text-lg">
          Calcule na hora o imposto de renda sobre suas operações na B3. Cobre swing trade (alíquota 15%, isenção até R$ 20 mil/mês de vendas, código DARF 6015) e day trade (20% sem isenção, código DARF 8523), com compensação automática de prejuízos e cálculo do vencimento do DARF. Sem planilha, sem cadastro, sem propaganda.
        </p>
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-check-circle" class="size-4" :style="{ color: 'var(--brand-positive)' }" />
            100% gratuito
          </span>
          <span>·</span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-zap" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
            Cálculo instantâneo
          </span>
          <span>·</span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-file-text" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
            DARF pronto (6015 / 8523)
          </span>
          <span>·</span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-calendar" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
            Compensa prejuízos
          </span>
        </div>
        <p class="text-[11px]" :style="{ color: 'var(--brand-text-muted)' }">
          Última atualização: {{ lastUpdatedText }}
        </p>
      </div>

      <CalculatorIncomeTax />

      <!-- Cenarios populares (internal linking + deep-links) -->
      <!--
        Cada link e uma "landing page virtual" que o Google indexa
        independente. IncomeTax.vue le `?type=`, `?sales=`, `?profit=`,
        `?loss=` e ja dispara o calculo no mount (quando o mes esta
        preenchido). Cobre as queries top-of-funnel "calcular IR day
        trade", "DARF swing trade R$ 25 mil", "isencao 20 mil acoes",
        "compensar prejuizo IR", etc.
      -->
      <div
        class="flex flex-col gap-3 rounded-[30px] border p-6"
        :style="{
          backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
          borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
        }"
      >
        <h2>Cenários populares de IR sobre ações</h2>
        <p class="text-sm">
          Clique em um cenário típico do investidor brasileiro e a calculadora carrega já preenchida com vendas, lucro e tipo de operação.
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

      <div class="max-w-none">
        <h2>Simulador de IR sobre ações grátis e online</h2>
        <p class="leading-relaxed">
          Use a calculadora acima para simular o imposto de renda devido em swing trade e day trade em segundos. Ideal pra apurar o DARF do mês antes do vencimento.
        </p>

        <h2>Como Funciona o IR sobre Ações no Brasil</h2>
        <p class="leading-relaxed">
          No Brasil, o Imposto de Renda sobre operações com ações segue regras específicas que todo investidor precisa conhecer. O não pagamento resulta em multas pesadas e problemas com a Receita Federal.
        </p>

        <h3>Regras Principais</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Swing Trade (Normal)</h4>
            <ul class="space-y-2 text-sm">
              <li>Alíquota: <strong>15%</strong> sobre o lucro</li>
              <li>Isenção: Vendas até <strong>R$ 20.000/mês</strong></li>
              <li>Código DARF: <strong>6015</strong></li>
              <li>Pode compensar prejuízos</li>
              <li>Dividendos são isentos</li>
            </ul>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Day Trade</h4>
            <ul class="space-y-2 text-sm">
              <li>Alíquota: <strong>20%</strong> sobre o lucro</li>
              <li><strong>Sem isenção</strong> (qualquer valor)</li>
              <li>Código DARF: <strong>8523</strong></li>
              <li>1% retido na fonte (crédito no IR)</li>
              <li>Mais complexo de controlar</li>
            </ul>
          </div>
        </div>

        <h2>Tributação de Dividendos: Mudanças com a Nova Lei (PL 1.087/2025)</h2>
        <p class="leading-relaxed">
          A grande dúvida do investidor brasileiro em 2026 é a tributação de dividendos. Vale a pena entender o que vale hoje e o que pode mudar nos próximos anos pra organizar a estratégia da carteira.
        </p>
        <h3>Status Atual (vigente em 2026)</h3>
        <p class="leading-relaxed">
          Dividendos de ações e FIIs continuam isentos de IR para pessoa física. JCP (Juros sobre Capital Próprio) tem 15% retidos na fonte, antes do crédito cair na conta. Essa estrutura está em vigor desde 1996 (Lei 9.249/1995) e é um dos atrativos históricos da bolsa brasileira para o investidor pessoa física.
        </p>
        <h3>O que o PL 1.087/2025 Propõe</h3>
        <p class="leading-relaxed">
          O Projeto de Lei 1.087/2025 propõe a retenção de 10% na fonte sobre dividendos pagos a pessoa física acima de R$ 50.000 por mês. Investidores que recebem menos do que esse limite mensal por empresa pagadora não seriam afetados na prática. O investidor médio brasileiro, que recebe poucos milhares de reais em dividendos por mês, não entra na regra.
        </p>
        <h3>Status Legislativo</h3>
        <p class="leading-relaxed">
          O PL foi aprovado na Câmara dos Deputados em 2025 e segue em apreciação no Senado em 2026. Se aprovado e sancionado neste ano, a vigência mais provável é janeiro de 2027 (pelo princípio da anterioridade nonagesimal e anual aplicável a tributos federais sobre a renda).
        </p>
        <h3>Estratégia Possível</h3>
        <p class="leading-relaxed">
          FIIs continuam isentos no texto atual do PL. Concentrar parte da carteira em FIIs que pagam dividendos mensais e em empresas com bom payout via JCP (que já tem retenção, mas a empresa abate como despesa dedutível e paga menos IR corporativo) pode mitigar o impacto futuro caso a regra entre em vigor. Importante: o cenário ainda está em construção e qualquer decisão tributária deve ser revisada conforme a tramitação avança.
        </p>
        <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">
          Aviso: a situação está em evolução. Acompanhe a tramitação no Senado e a sanção presidencial antes de tomar decisões definitivas. Esta calculadora trabalha com as regras vigentes em 2026.
        </p>

        <h2>Passo a Passo para Pagar o DARF</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              1
            </div>
            <div>
              <h4>Separe Swing Trade e Day Trade</h4>
              <p class="text-sm">
                São tributações diferentes (15% e 20%) e gavetas separadas de prejuízos. Calcule cada modalidade isoladamente. A calculadora tem um botão pra trocar entre os dois.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              2
            </div>
            <div>
              <h4>Calcule o Lucro do Mês</h4>
              <p class="text-sm">
                Some todas as vendas e subtraia os custos de compra. Inclua corretagem, emolumentos B3 e taxas, eles abatem o lucro tributável.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              3
            </div>
            <div>
              <h4>Verifique a Isenção (R$ 20 mil)</h4>
              <p class="text-sm">
                No swing trade, se as vendas totais do mês forem até R$ 20 mil, o lucro é isento de IR. Atenção: a isenção é sobre VENDAS, não sobre lucro. Day trade não tem essa regra.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              4
            </div>
            <div>
              <h4>Compense Prejuízos Acumulados</h4>
              <p class="text-sm">
                Se você teve prejuízo em meses anteriores (na mesma modalidade), pode abater do lucro atual antes de calcular o IR. Prejuízo não tem prazo de validade.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              5
            </div>
            <div>
              <h4>Gere e Pague o DARF até o Vencimento</h4>
              <p class="text-sm">
                Acesse o Sicalc Web da Receita Federal ou seu banco. Use código 6015 (swing) ou 8523 (day trade). Vencimento é o último dia útil do mês seguinte ao das operações.
              </p>
            </div>
          </div>
        </div>

        <h2>Como Declarar Suas Ações no IRPF 2026</h2>
        <p class="leading-relaxed">
          Pagar o DARF mensal não substitui a declaração anual no IRPF. A Receita Federal exige a declaração completa de operações em renda variável, mesmo as isentas, e cruza a informação com a e-Financeira das corretoras. Veja o que precisa ser feito:
        </p>
        <h3>Quando Você é Obrigado a Declarar</h3>
        <ul class="list-disc pl-6 text-sm leading-relaxed">
          <li>Vendas totais em ações superiores a R$ 40.000 no ano (mesmo que isentas mensalmente).</li>
          <li>Qualquer operação com IR devido (swing trade tributado ou day trade).</li>
          <li>Recebimento de dividendos acima de R$ 200/mês ou demais critérios gerais do IRPF.</li>
          <li>Saldo de ativos em renda variável superior a R$ 1.000 em 31/12.</li>
        </ul>
        <h3>Onde Declarar Cada Item</h3>
        <ul class="list-disc pl-6 text-sm leading-relaxed">
          <li><strong>Bens e Direitos (código 31):</strong> ações ordinárias e preferenciais detidas em 31/12.</li>
          <li><strong>Bens e Direitos (código 73):</strong> cotas de FIIs em 31/12.</li>
          <li><strong>Rendimentos Isentos e Não Tributáveis (linha 9):</strong> dividendos recebidos.</li>
          <li><strong>Rendimentos Sujeitos à Tributação Exclusiva (linha 6):</strong> JCP (Juros sobre Capital Próprio).</li>
          <li><strong>Renda Variável (anexo):</strong> operações sujeitas a IR (lucros, prejuízos, IR pago via DARF, IR retido na fonte).</li>
        </ul>
        <h3>Ferramentas Oficiais</h3>
        <ul class="list-disc pl-6 text-sm leading-relaxed">
          <li><strong>GCAP:</strong> programa da Receita Federal pra calcular ganho de capital fora da bolsa, gera arquivo que importa direto no IRPF.</li>
          <li><strong>Sicalc Web:</strong> ferramenta oficial para gerar DARF mensal (códigos 6015 e 8523).</li>
          <li><strong>Programa IRPF:</strong> baixe o programa do ano-base 2026 no site da Receita Federal pra preencher e transmitir a declaração.</li>
        </ul>
        <h3>Erros Comuns que Caem na Malha Fina</h3>
        <ul class="list-disc pl-6 text-sm leading-relaxed">
          <li>Esquecer de declarar saldo de ações ou FIIs em 31/12 (mesmo se já constava em ano anterior).</li>
          <li>Não somar custos de aquisição (corretagem, emolumentos), inflando o lucro tributado.</li>
          <li>Misturar gavetas de prejuízo (swing trade, day trade, FIIs e criptomoedas têm controles separados).</li>
          <li>Omitir dividendos sob a justificativa de serem isentos. Isenção exige declaração mesmo assim.</li>
          <li>Declarar valor de mercado em vez de custo de aquisição em Bens e Direitos (a regra é custo de aquisição).</li>
        </ul>

        <h2>IR sobre FIIs (Fundos Imobiliários)</h2>
        <p class="leading-relaxed">
          Fundos Imobiliários têm regime tributário próprio, diferente das ações. Saber a regra evita pagar imposto a mais ou a menos.
        </p>
        <h3>Dividendos Mensais</h3>
        <p class="leading-relaxed">
          Os rendimentos mensais distribuídos pelos FIIs são ISENTOS de IR para pessoa física. Para a isenção valer, o FII precisa atender três condições: cota negociada em bolsa (ou mercado de balcão organizado), ter pelo menos 50 cotistas e o investidor não pode deter mais de 10% do total de cotas.
        </p>
        <h3>Ganho de Capital na Venda</h3>
        <p class="leading-relaxed">
          A alíquota é de 20% sobre o lucro da venda da cota (compra menos venda menos custos). NÃO existe a isenção dos R$ 20 mil/mês que vale para ações. Toda venda de FII com lucro paga IR de 20%, mesmo se a venda total do mês for pequena.
        </p>
        <h3>Compensação de Prejuízo</h3>
        <p class="leading-relaxed">
          Prejuízo em FII compensa apenas lucro futuro de FII (gaveta separada de ações, ETFs e criptos). A compensação é indefinida no tempo.
        </p>
        <h3>Exemplo Prático</h3>
        <p class="leading-relaxed">
          Você comprou 100 cotas de HGLG11 a R$ 150 (custo R$ 15.000) e vendeu por R$ 160 (R$ 16.000). Lucro bruto R$ 1.000. IR devido: 20% × R$ 1.000 = R$ 200. Pague via DARF código 6015 até o último dia útil do mês seguinte. Declare em Bens e Direitos (código 73), Renda Variável e Rendimentos Isentos (dividendos recebidos no ano).
        </p>

        <h2>IR sobre Criptomoedas</h2>
        <p class="leading-relaxed">
          Bitcoin, Ethereum e demais criptomoedas têm regime próprio definido pela IN RFB 1.888/2019 e atualizações. Confunde porque parece ações, mas as regras divergem em pontos importantes.
        </p>
        <h3>Faixa de Isenção Mensal</h3>
        <p class="leading-relaxed">
          Vendas de criptomoedas até R$ 35.000 por mês (somando todos os ativos) são ISENTAS de IR. Acima desse limite, todo o lucro é tributado.
        </p>
        <h3>Alíquotas Progressivas</h3>
        <ul class="list-disc pl-6 text-sm leading-relaxed">
          <li>15% sobre lucro até R$ 5 milhões.</li>
          <li>17,5% sobre lucro entre R$ 5 milhões e R$ 10 milhões.</li>
          <li>20% sobre lucro entre R$ 10 milhões e R$ 30 milhões.</li>
          <li>22,5% sobre lucro acima de R$ 30 milhões.</li>
        </ul>
        <h3>DARF e Vencimento</h3>
        <p class="leading-relaxed">
          Use o código DARF 4600. Vencimento é o último dia útil do mês seguinte ao da operação tributável. Não dá pra compensar prejuízo de criptomoedas com lucro de ações nem com FIIs (cada um em sua própria gaveta).
        </p>
        <h3>Declaração no IRPF</h3>
        <p class="leading-relaxed">
          Quem teve saldo superior a R$ 5.000 em criptomoedas em 31/12 deve declarar em Bens e Direitos com os códigos: 81 (Bitcoin), 82 (Ethereum) e 89 (demais criptoativos). As corretoras Mercado Bitcoin, Binance, Foxbit e demais geram relatórios anuais de movimentação que ajudam a preencher os campos. Quem opera há mais tempo precisa também observar a obrigação acessória mensal da IN 1.888 quando movimenta acima de R$ 30 mil em uma única exchange.
        </p>

        <h2>Perguntas Frequentes sobre IR de Ações</h2>

        <div class="space-y-4">
          <details
            v-for="item in faqItems"
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
            <p class="mt-3 text-sm">{{ item.a }}</p>
          </details>
        </div>

        <h2>Evite Estes Erros</h2>
        <div class="space-y-3">
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: `color-mix(in srgb, var(--brand-negative) 25%, transparent)`,
              backgroundColor: `color-mix(in srgb, var(--brand-negative) 8%, transparent)`,
            }"
          >
            <h4 class="mb-1" :style="{ color: 'var(--brand-negative)' }">Não Controlar as Operações</h4>
            <p class="text-sm">
              Use planilha ou software. Não dá para confiar apenas na memória ou esperar a corretora fazer tudo.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: `color-mix(in srgb, var(--brand-negative) 25%, transparent)`,
              backgroundColor: `color-mix(in srgb, var(--brand-negative) 8%, transparent)`,
            }"
          >
            <h4 class="mb-1" :style="{ color: 'var(--brand-negative)' }">Esquecer de Pagar o DARF</h4>
            <p class="text-sm">
              Multa de 0,33% ao dia. Configure lembretes, último dia útil do mês seguinte.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: `color-mix(in srgb, var(--brand-negative) 25%, transparent)`,
              backgroundColor: `color-mix(in srgb, var(--brand-negative) 8%, transparent)`,
            }"
          >
            <h4 class="mb-1" :style="{ color: 'var(--brand-negative)' }">Não Declarar Operações Isentas</h4>
            <p class="text-sm">
              Mesmo isento, você DEVE declarar no IRPF anual. Omissão gera malha fina.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: `color-mix(in srgb, var(--brand-negative) 25%, transparent)`,
              backgroundColor: `color-mix(in srgb, var(--brand-negative) 8%, transparent)`,
            }"
          >
            <h4 class="mb-1" :style="{ color: 'var(--brand-negative)' }">Misturar Swing e Day Trade</h4>
            <p class="text-sm">
              São tratados separadamente. Prejuízo de um não compensa lucro do outro.
            </p>
          </div>
        </div>
      </div>

      <!-- Rankings Relacionados -->
      <div
        class="mt-8 flex flex-col gap-4 rounded-[30px] p-6"
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

      <div
        class="flex flex-col gap-4 rounded-[30px] p-6"
        :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
      >
        <h2>Outras Ferramentas</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/acoes"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <UIcon name="i-lucide-chart-line" class="text-secondary size-8 shrink-0" />
            <div>
              <h3>Simulador de Ações</h3>
              <p class="text-sm">Simule investimentos em ações</p>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/calculadora/preco-teto"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <UIcon name="i-lucide-target" class="text-secondary size-8 shrink-0" />
            <div>
              <h3>Preço Teto</h3>
              <p class="text-sm">Descubra se ação está barata</p>
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
            Conteúdo revisado pela equipe de análise da {{ brand.name }}
          </p>
          <p>
            Cálculos baseados nas regras vigentes da Receita Federal do Brasil para tributação de ganhos em renda variável (Lei 11.033/2004 e IN RFB 1.585/2015): swing trade com alíquota de 15% e isenção de R$ 20 mil/mês em vendas, day trade com alíquota de 20% sem isenção, vencimento do DARF no último dia útil do mês subsequente.
          </p>
          <p class="text-xs">
            Fontes: <a href="https://www.gov.br/receitafederal" target="_blank" rel="noopener nofollow" class="underline hover:text-secondary">Receita Federal do Brasil</a>,
            <a href="https://www.b3.com.br" target="_blank" rel="noopener nofollow" class="underline hover:text-secondary">B3 (Brasil, Bolsa, Balcão)</a>,
            <a href="https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033.htm" target="_blank" rel="noopener nofollow" class="underline hover:text-secondary">Lei 11.033/2004</a>.
          </p>
        </div>
      </aside>

      <MoleculesCtaSection
        :title="`Controle seus investimentos na ${brand.name}`"
        description="Acompanhe sua carteira, receba alertas e tenha relatórios prontos para o IR."
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

// Rankings relacionados — ponte pra dividendos (isento de IR ate o
// limite mensal) e maiores altas (planejar venda com base em ganho).
const relatedRankings = [
  {
    to: '/ranking/maiores-dividend-yield',
    icon: 'i-lucide-coins',
    title: 'Dividendos isentos de IR',
    sub: 'Maiores DY pra renda passiva sem IR',
  },
  {
    to: '/ranking/maiores-altas-mes',
    icon: 'i-lucide-trending-up',
    title: 'Maiores altas (planejar venda)',
    sub: 'Top performers nos últimos 30 dias',
  },
] as const

// Refresh signal — `dateModified` no JSON-LD vem deste valor.
// Bump CONTENT_VERSION quando houver mudanca real na calculadora,
// nas regras tributarias ou no conteudo educacional.
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const lastUpdatedISO = lastUpdated.toISOString()

// ====================================================================
// Cenarios populares — long-tail SEO via deep-links.
// Cada cenario combina type+sales+profit em URL canonica que o
// IncomeTax.vue ja le no mount. Captura queries "calcular IR day
// trade R$ 5 mil", "DARF swing trade 25 mil", "isencao IR 20 mil
// acoes", "compensar prejuizo IR", etc.
// ====================================================================
const popularScenarios = [
  { label: 'Lucro R$ 2.000 swing trade', sub: 'Vendas R$ 25 mil, IR 15%', icon: 'i-lucide-trending-up', to: '/calculadora/imposto-renda?type=swing&sales=25000&profit=2000' },
  { label: 'Lucro R$ 5.000 day trade', sub: 'Sem isenção, IR 20%', icon: 'i-lucide-zap', to: '/calculadora/imposto-renda?type=day&sales=80000&profit=5000' },
  { label: 'Vendas R$ 15.000 (isento)', sub: 'Lucro de R$ 3 mil, sem IR', icon: 'i-lucide-shield-check', to: '/calculadora/imposto-renda?type=swing&sales=15000&profit=3000' },
  { label: 'Vendas R$ 25.000 swing', sub: 'Lucro R$ 3 mil, paga IR', icon: 'i-lucide-receipt', to: '/calculadora/imposto-renda?type=swing&sales=25000&profit=3000' },
  { label: 'Compensar prejuízo R$ 1.000', sub: 'Reduz IR no mês seguinte', icon: 'i-lucide-undo-2', to: '/calculadora/imposto-renda?type=swing&sales=30000&profit=2000&loss=1000' },
  { label: 'Day trade lucro R$ 10.000', sub: 'IR de R$ 2.000 (20%)', icon: 'i-lucide-flame', to: '/calculadora/imposto-renda?type=day&sales=120000&profit=10000' },
  { label: 'Swing R$ 50 mil em vendas', sub: 'Lucro R$ 8 mil tributado', icon: 'i-lucide-banknote', to: '/calculadora/imposto-renda?type=swing&sales=50000&profit=8000' },
  { label: 'Prejuízo no mês', sub: 'Acumula pra compensar', icon: 'i-lucide-trending-down', to: '/calculadora/imposto-renda?type=swing&sales=30000&profit=-2000' },
  { label: 'Day trade prejuízo R$ 1.500', sub: 'Acumula em gaveta day', icon: 'i-lucide-arrow-down-right', to: '/calculadora/imposto-renda?type=day&sales=40000&profit=-1500' },
  { label: 'Isenção exata R$ 20 mil', sub: 'Acima disso, IR sobre tudo', icon: 'i-lucide-target', to: '/calculadora/imposto-renda?type=swing&sales=20000&profit=2000' },
] as const

// FAQs servem como fonte unica entre o HTML (renderizado nos `<details>`)
// e o FAQPage schema (mainEntity). Antes o schema tinha so 3 perguntas
// e o HTML 5 — Google ignora FAQs nao espelhados.
const faqItems = [
  {
    q: 'O que acontece se eu não pagar o IR sobre ações?',
    a: 'Multa de 0,33% por dia de atraso (até o teto de 20%) somada aos juros Selic, mais cair na malha fina do IRPF anual. Em casos graves de omissão dolosa, configura crime contra a ordem tributária (Lei 8.137/90) com pena de 2 a 5 anos de reclusão. Se você esqueceu, pague o DARF em atraso o quanto antes, a multa é menor que sonegar.',
  },
  {
    q: 'Como funciona a isenção de R$ 20.000 em vendas?',
    a: 'Para swing trade, se o total de vendas de ações no mês for até R$ 20.000, o lucro fica isento de IR. Atenção: é sobre VENDAS brutas, não lucro. Se vendeu R$ 19 mil e lucrou R$ 5 mil, está isento. Se vendeu R$ 21 mil e lucrou só R$ 100, paga 15% de IR sobre os R$ 100. Vale por mês fiscal e por modalidade. Day trade NÃO tem essa isenção. Importante: a isenção não vale para FIIs nem ETFs.',
  },
  {
    q: 'Posso compensar prejuízos de meses anteriores?',
    a: 'Sim, e indefinidamente. Prejuízos no swing trade compensam lucros futuros do swing trade (gaveta separada). Prejuízos do day trade compensam lucros do day trade. Não cruzam: prejuízo de swing não abate lucro de day trade. Exemplo: prejuízo de R$ 3 mil em janeiro, lucro de R$ 5 mil em fevereiro = IR de 15% sobre apenas R$ 2 mil = R$ 300. Mantenha controle rigoroso, a Receita exige histórico.',
  },
  {
    q: 'Tenho que declarar operações isentas no IRPF?',
    a: 'Sim, mesmo operações isentas (vendas abaixo de R$ 20 mil) precisam constar no IRPF anual. Você declara: 1) saldo de ações em 31/12 (ficha "Bens e Direitos"); 2) operações realizadas no ano (ficha "Renda Variável"); 3) dividendos recebidos (ficha "Rendimentos Isentos"); 4) prejuízos acumulados (ficha "Prejuízos Acumulados"). A Receita cruza com a declaração das corretoras (e-Financeira), omissão é detectada e cai na malha fina.',
  },
  {
    q: 'Corretagem e taxas podem ser deduzidas do lucro?',
    a: 'Sim. Corretagem, emolumentos B3, taxa de custódia, ISS sobre corretagem e qualquer custo direto da operação são deduzidos do lucro tributável. Mantenha as notas de corretagem organizadas por mês. Exemplo: vendeu por R$ 10.000, comprou por R$ 8.000, pagou R$ 100 em custos totais. Lucro tributável = R$ 10.000 menos R$ 8.000 menos R$ 100, dá R$ 1.900. IR de 15% = R$ 285.',
  },
  {
    q: 'Qual a diferença entre swing trade e day trade pra fins de IR?',
    a: 'Day trade é a operação aberta e fechada no MESMO PREGÃO (mesmo dia, mesma corretora, mesmo ativo). Tudo o mais é swing trade, mesmo que você feche no dia seguinte. Swing: 15% de IR + isenção de R$ 20 mil/mês em vendas + DARF 6015. Day: 20% de IR + sem isenção + DARF 8523 + 1% retido na fonte como antecipação (você abate no DARF). São apurados separadamente, prejuízos não cruzam entre si.',
  },
  {
    q: 'Quando vence o DARF de IR sobre ações?',
    a: 'Último dia útil do mês seguinte ao das operações. Operações de janeiro = DARF vence em 28 de fevereiro (ou último dia útil). Operações de novembro = DARF vence em 31 de dezembro. Se o último dia cair em sábado/domingo/feriado, vai pro próximo dia útil. Atenção em dezembro, se o último dia útil cair antes de 31, conte com isso. Pague antes via Sicalc Web ou no internet banking, sem stress.',
  },
  {
    q: 'Como gerar o DARF na prática?',
    a: 'Três caminhos: 1) Sicalc Web da Receita Federal (gov.br/receitafederal), você preenche código (6015 ou 8523), valor, mês de competência e gera o boleto; 2) app do seu banco (Itaú, Bradesco, Nubank, etc), vá em "Pagar > Tributos" e siga; 3) gerador automático em corretoras (XP, Rico, NuInvest) que já calculam pra você. Use a calculadora desta página pra confirmar o valor antes.',
  },
  {
    q: 'IR de FIIs é diferente de IR de ações?',
    a: 'Sim. FIIs têm dividendos isentos de IR (igual ações), mas o ganho de capital tem alíquota de 20% (não 15%) e SEM isenção dos R$ 20 mil. Toda venda de FII com lucro paga IR de 20% sobre o ganho. Código DARF é 6015 também (mesmo de swing trade de ações), mas a alíquota é diferente. Prejuízos de FII compensam só lucros de FII, não cruzam com ações.',
  },
  {
    q: 'IR sobre dividendos: tenho que pagar?',
    a: 'Atualmente não. Dividendos de ações e FIIs são isentos de IR pra pessoa física no Brasil, é um dos atrativos da bolsa brasileira. Atenção: JCP (Juros sobre Capital Próprio) tem 15% retido na fonte, mas ainda compensa porque a empresa abate como despesa dedutível e paga menos IR corporativo (você recebe líquido, sem mais imposto a recolher). Reformas tributárias podem mudar a regra, sempre cheque a legislação vigente.',
  },
  {
    q: 'O que acontece se eu vender ações no exterior?',
    a: 'Outras regras. Ganho de capital em ações estrangeiras (incluindo BDRs sem regime de fundos) tem alíquota progressiva de 15% a 22,5% conforme o lucro acumulado anual. BDRs negociados na B3 seguem regras de ações brasileiras (15% + isenção). REITs americanos têm dividendos com retenção na fonte de 30% (parte recuperável via tratado), e ganho de capital tributado pela tabela progressiva. Esta calculadora é focada em ações da B3, para o exterior consulte um contador.',
  },
  {
    q: 'Como declarar dividendos no IRPF?',
    a: 'Dividendos são rendimentos isentos. Declare em "Rendimentos Isentos e Não Tributáveis" linha 9 (lucros e dividendos recebidos). JCP entra em "Rendimentos Sujeitos à Tributação Exclusiva" linha 6. Some os valores recebidos durante o ano por empresa, com CNPJ do pagador. Os informes de rendimentos das corretoras já trazem essa separação.',
  },
  {
    q: 'FIIs têm IR sobre os dividendos?',
    a: 'Não. Dividendos mensais de FIIs negociados em bolsa são ISENTOS de IR pra pessoa física, desde que o FII tenha 50+ cotistas e o investidor não detenha mais de 10% das cotas. O ganho de capital na venda da cota tem 20% de IR (sem isenção R$ 20k que vale só pra ações). DARF código 6015.',
  },
  {
    q: 'Como funciona o IR sobre criptomoedas no Brasil?',
    a: 'Vendas até R$ 35.000/mês são isentas. Acima, alíquota progressiva: 15% até R$ 5M, 17,5% até R$ 10M, 20% até R$ 30M, 22,5% acima. DARF código 4600, vence no último dia útil do mês seguinte. Saldo acima de R$ 5.000 em 31/12 deve constar em Bens e Direitos (código 81 BTC, 82 ETH, 89 outras).',
  },
  {
    q: 'Como funciona a tributação de dividendos a partir de 2026?',
    a: 'O PL 1.087/2025 propõe 10% retidos na fonte sobre dividendos pagos a PF acima de R$ 50.000 por mês. Investidores menores não seriam afetados. O PL foi aprovado na Câmara em 2025 e segue em discussão no Senado em 2026. Se aprovado, a vigência mais provável é 2027. FIIs continuam isentos no texto atual.',
  },
] as const

const pageTitle = `Calculadora de IR sobre Ações 2026 - Day e Swing | ${brand.name}`
const pageDescription =
  'Calcule IR sobre swing trade e day trade. DARF 6015 e 8523, isenção R$ 20k, declaração IRPF, FIIs, criptomoedas, PL dividendos 2026. Grátis.'

usePageSeo({
  title: pageTitle,
  description: pageDescription,
  path: '/calculadora/imposto-renda',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Imposto de Renda', path: '/calculadora/imposto-renda' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `Calculadora de IR sobre Ações ${brand.name}`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      dateModified: lastUpdatedISO,
      description:
        'Calculadora gratuita de IR sobre ações com geração de informações para DARF, compensação de prejuízos acumulados, verificação de isenção de R$ 20 mil/mês em swing trade e cálculo automático do vencimento.',
      featureList: [
        'Cálculo de IR para swing trade (alíquota 15%)',
        'Cálculo de IR para day trade (alíquota 20%)',
        'Verificação automática da isenção de R$ 20 mil/mês',
        'Compensação de prejuízos acumulados em swing trade',
        'Geração de informações para DARF (códigos 6015 e 8523)',
        'Cálculo do vencimento do DARF (último dia útil do mês seguinte)',
        'Cenários populares pré-preenchidos via URL (deep-link)',
        'Cobertura das regras vigentes da Receita Federal',
        'Sem cadastro, sem propaganda, gratuito',
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

<template>
  <NuxtLayout name="default" title="Calculadora de Dividend Yield">
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
          <UIcon name="i-lucide-coins" class="text-secondary h-8 w-8" />
          <h1
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(28px, 4vw, 36px)',
              lineHeight: 1.05,
              letterSpacing: '-0.7px',
            }"
          >Calculadora de Dividend Yield 2026: DY Atual, Projetado e On Cost de Ações e FIIs</h1>
        </div>
        <p class="text-base md:text-lg" :style="{ color: 'var(--brand-text)' }">
          Dividend Yield (DY) é o percentual de dividendos pagos em relação ao preço da ação: DY = (Dividendos Anuais ÷ Preço) × 100. Exemplo: ITUB4 a R$ 28,00 com R$ 1,80 anual tem DY de 6,4%. Considerado bom: 4-8% para ações, 8-12% para FIIs. Esta calculadora mostra DY atual, projetado e on cost (no seu preço de compra).
        </p>
        <p class="text-base md:text-lg">
          Calcule na hora o dividend yield de qualquer ação ou FII da B3. Veja DY atual, DY on cost (sobre o seu preço de compra), projeção do DY em 1 e 3 anos com base em LPA, payout e crescimento, e compare ITUB4, PETR4, BBAS3, TAEE11 e centenas de outras pagadoras de dividendos. Ideal pra montar carteira de renda passiva, sem planilha, sem cadastro, sem propaganda.
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
            <UIcon name="i-lucide-coins" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
            Ações e FIIs
          </span>
          <span>·</span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-trending-up" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
            DY on cost + projeção
          </span>
        </div>
        <p class="text-[11px]" :style="{ color: 'var(--brand-text-muted)' }">
          Última atualização: {{ lastUpdatedText }}
        </p>
      </div>

      <CalculatorDividendYield :assets="assets" :assets-loading="assetsLoading" />

      <!-- Cenarios populares (internal linking + deep-links) -->
      <!--
        Cada link e uma "landing page virtual" que o Google indexa
        independente. DividendYield.vue le `?ticker=`, `?price=`,
        `?dividend=`, `?purchase=`, etc. e ja dispara o calculo no
        mount. Padrao identico aos popular tickers da preco-teto.
        Cobre as queries top-of-funnel "dividend yield ITUB4 calcular",
        "DY on cost PETR4", "DY FII TAEE11", "comparar DY acoes FIIs".
      -->
      <div
        class="flex flex-col gap-3 rounded-[30px] border p-6"
        :style="{
          backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
          borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
        }"
      >
        <h2>Cenários populares de dividend yield</h2>
        <p class="text-sm">
          Veja na hora o DY dos ativos mais buscados e os cenários on cost mais comuns. Basta clicar e a calculadora carrega já preenchida.
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
        <h2>Simulador de dividend yield grátis e online</h2>
        <p class="leading-relaxed">
          Use a calculadora acima para simular o DY de qualquer ação ou FII da B3 em segundos. Ideal pra comparar pagadoras antes de montar a carteira de renda passiva.
        </p>

        <h2>O que é Dividend Yield?</h2>
        <p class="leading-relaxed">
          Dividend Yield (DY) é um indicador que mostra quanto uma empresa paga em dividendos em relação ao preço da ação. É expresso em porcentagem anual e é fundamental para quem investe buscando renda passiva.
        </p>

        <div class="brand-card border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg">
            Dividend Yield = (Dividendos Anuais ÷ Preço da Ação) × 100
          </p>
          <div class="mt-4 text-center text-sm">
            <p><strong>Exemplo:</strong> Ação custa R$ 25 e paga R$ 1,50/ano em dividendos</p>
            <p class="text-secondary">DY = (1,50 ÷ 25) × 100 = 6% ao ano</p>
          </div>
        </div>

        <h3>DY On Cost, O Verdadeiro Retorno</h3>
        <p class="leading-relaxed">
          DY on cost é o dividend yield calculado sobre o seu preço de compra, não o preço atual. Se você comprou uma ação por R$ 20 e ela vale R$ 30 hoje, mas continua pagando R$ 1,50 de dividendo, seu DY on cost é 7,5% (1,50÷20), não 5% (1,50÷30).
        </p>
        <p class="leading-relaxed">
          Este é o conceito mais importante para investidores de dividendos. Com o tempo, conforme os dividendos crescem e você mantém seu preço de compra baixo, seu DY on cost pode chegar a 10%, 15% ou até 20% ao ano, é a chamada "máquina de juros" defendida por Décio Bazin e Luiz Barsi.
        </p>

        <h2>Média de DY por Tipo de Ativo</h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
            >
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Tipo de Ativo</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">DY Típico</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Observações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Ações Blue Chips</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">4-8%</td>
                <td class="border px-4 py-2 text-sm" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Bancos, energia, saneamento</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Ações Growth</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">0-3%</td>
                <td class="border px-4 py-2 text-sm" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Reinvestem lucro no crescimento</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">FIIs Tijolo</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">8-12%</td>
                <td class="border px-4 py-2 text-sm" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Logística, lajes corporativas, shoppings</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">FIIs Papel</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">9-13%</td>
                <td class="border px-4 py-2 text-sm" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">CRIs, debêntures</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Small Caps</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">2-6%</td>
                <td class="border px-4 py-2 text-sm" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Foco em crescimento, DY menor</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">ETFs de Dividendos</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">6-9%</td>
                <td class="border px-4 py-2 text-sm" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">DIVO11, BOVA11 (parcial), FIND11, ETFs internacionais (MSTY com cuidado)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Tributação de Dividendos no Brasil (Lei e Mudanças 2026)</h2>
        <p class="leading-relaxed">
          A tributação de dividendos no Brasil sempre foi um diferencial competitivo: dividendos pagos por empresas listadas a pessoa física são isentos de Imposto de Renda. Essa regra está em discussão no Congresso desde 2025 e pode mudar nos próximos anos. Entender o cenário atual e o que está em tramitação ajuda você a planejar a carteira de dividendos sem ser pego de surpresa.
        </p>

        <h3>Como funciona hoje (até 2025 / 2026)</h3>
        <div
          class="brand-card border p-5"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
            borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
          }"
        >
          <ul class="space-y-2 text-sm">
            <li><strong>Dividendos de ações:</strong> isentos de IR pra pessoa física, sem limite de valor.</li>
            <li><strong>JCP (Juros sobre Capital Próprio):</strong> 15% retidos na fonte, mas a empresa abate como despesa e paga menos IR corporativo, então no agregado costuma valer mais.</li>
            <li><strong>FIIs (Fundos Imobiliários):</strong> dividendos isentos pra pessoa física desde que o FII tenha 50+ cotistas, seja listado em bolsa e o investidor possua menos de 10% das cotas.</li>
            <li><strong>Ganho de capital (vender mais caro do que comprou):</strong> 15% sobre o lucro acima de R$ 20.000/mês de vendas (ações). 20% pra FIIs, sem isenção.</li>
          </ul>
        </div>

        <h3>O que pode mudar (PL 1.087/2025)</h3>
        <p class="leading-relaxed">
          O Projeto de Lei 1.087/2025 propõe taxar dividendos pagos a pessoa física acima de R$ 50.000 por mês a 10% retidos na fonte. Pra investidor médio (R$ 5.000 a R$ 10.000/mês de dividendos), a probabilidade de ser afetado é baixa. O PL foi aprovado na Câmara em 2025 e está em apreciação no Senado em 2026. Caso aprovado sem grandes alterações, a vigência mais provável é 2027.
        </p>
        <div
          class="brand-card border p-5"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
            borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
          }"
        >
          <h4 class="mb-2 text-secondary">O que pode mudar no texto final</h4>
          <ul class="space-y-2 text-sm">
            <li>Alíquota efetiva (atual proposta: 10%; pode subir até 15% no Senado).</li>
            <li>Faixa de isenção (atual proposta: R$ 50.000/mês; pode cair pra R$ 20.000 ou subir pra R$ 100.000).</li>
            <li>Vigência (provável 2027 se aprovado em 2026; o texto exige noventena + anualidade).</li>
            <li>Isenção pra FIIs e empresas tributadas pelo Simples Nacional permanece pelo texto atual, mas pode ser revisada em emendas.</li>
          </ul>
        </div>
        <p class="leading-relaxed">
          Recomendação prática: planeje como se fosse implementar pra não ser pego de surpresa. Concentre parte da carteira em FIIs (isenção mantida), monitore o trâmite no Congresso e tenha em mente que mudanças tributárias do gênero costumam ser graduais (alíquota crescente, faixa de isenção, transição plurianual).
        </p>

        <h3>FIIs com Dividendos Mensais</h3>
        <p class="leading-relaxed">
          FIIs (Fundos de Investimento Imobiliário) são o veículo preferido de quem busca dividendos mensais e isenção de IR no Brasil. Por lei, distribuem 95% ou mais do lucro do fundo, geralmente todo mês (até o dia 25). Existem dois grandes blocos com perfis distintos.
        </p>
        <div
          class="brand-card border p-5"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
            borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
          }"
        >
          <ul class="space-y-2 text-sm">
            <li><strong>FIIs de tijolo:</strong> investem em imóveis físicos (logística, lajes corporativas, shoppings, hospitais). DY típico 8-10%, valor da cota oscila com o ciclo imobiliário.</li>
            <li><strong>FIIs de papel:</strong> investem em CRIs (Certificados de Recebíveis Imobiliários) e debêntures, recebem juros. DY típico 9-13%, mais correlacionado com Selic e CDI.</li>
          </ul>
          <p class="mt-3 text-sm">
            Exemplos com track record consistente: HGLG11 (logística), KNCR11 (papel), MXRF11 (papel), VISC11 (shoppings), HSML11 (shoppings), GGRC11 (logística), DIVD11 (paga DY+ alto), SNLG11 (papel high-yield). Uma carteira diversificada de renda passiva costuma combinar tijolo (proteção real e estabilidade) com papel (yield maior e menor exposição ao ciclo imobiliário).
          </p>
        </div>

        <h2>Como Usar a Calculadora de Dividend Yield</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              1
            </div>
            <div>
              <h4>Escolha o Ativo (ou Insira Valores Manualmente)</h4>
              <p class="text-sm">
                Busque por ticker (PETR4, ITUB4, TAEE11) na lista. A calculadora também aceita valores manuais, útil pra ações fora da B3 ou simulações hipotéticas.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              2
            </div>
            <div>
              <h4>Veja o DY Atual</h4>
              <p class="text-sm">
                Modo Simples mostra o DY anual com base no preço atual e dividendos dos últimos 12 meses. É o número que você vê em rankings de "melhores pagadoras de dividendos".
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              3
            </div>
            <div>
              <h4>Calcule o DY On Cost</h4>
              <p class="text-sm">
                Modo On Cost compara o DY atual com o DY no seu preço de compra original. Mostra o "verdadeiro" retorno do investimento, separando dividendos de ganho de capital.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              4
            </div>
            <div>
              <h4>Projete o DY Futuro</h4>
              <p class="text-sm">
                Modo Projeção usa LPA, payout ratio e crescimento estimado do lucro pra prever o DY em 1 e 3 anos. Útil pra avaliar se a ação ainda compensa em horizonte longo.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              5
            </div>
            <div>
              <h4>Compare com a Média do Setor</h4>
              <p class="text-sm">
                Use a tabela de DY típico por categoria (blue chips, FIIs, growth) pra contextualizar o resultado. DY de 12% num blue chip pode ser sinal de risco, num FII de papel é normal.
              </p>
            </div>
          </div>
        </div>

        <h2>Perguntas Frequentes sobre Dividend Yield</h2>

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

      <div
        class="flex flex-col gap-4 rounded-[30px] p-6"
        :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
      >
        <h2>Outras Ferramentas</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/planejamento"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <UIcon name="i-lucide-target" class="text-secondary size-8 shrink-0" />
            <div>
              <h3>Planejamento Patrimonial</h3>
              <p class="text-sm">Carteira com foco em dividendos</p>
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
              <p class="text-sm">Veja se a ação está barata</p>
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
            Cálculos baseados nas fórmulas clássicas de avaliação por dividendos (DY = Dividendos ÷ Preço, DY on cost = Dividendos ÷ Preço de Compra) e referenciam a metodologia de Décio Bazin e Luiz Barsi para análise de pagadoras de dividendos no mercado brasileiro. Os tickers exibidos vêm da B3 em tempo real via API oficial.
          </p>
          <p class="text-xs">
            Fontes: <a href="https://www.b3.com.br" target="_blank" rel="noopener nofollow" class="underline hover:text-secondary">B3 (Brasil, Bolsa, Balcão)</a>,
            <a href="https://www.cvm.gov.br" target="_blank" rel="noopener nofollow" class="underline hover:text-secondary">CVM</a>,
            <a href="https://www.bcb.gov.br" target="_blank" rel="noopener nofollow" class="underline hover:text-secondary">Banco Central do Brasil</a>.
          </p>
        </div>
      </aside>

      <MoleculesCtaSection
        title="Encontre as melhores pagadoras de dividendos"
        description="Compare dividend yield de todas as ações e FIIs da B3 em tempo real."
        :buttons="[
          { label: 'Ver ranking de dividendos', to: '/dividendos', icon: 'i-lucide-arrow-right', variant: 'primary' },
          { label: 'Criar conta grátis', to: '/auth/register', variant: 'outline' },
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
const { getAssets } = useAssetsService()
const { data: assetsData, pending: assetsPending } = await useAsyncData(
  'assets-calculator-dividend-yield',
  () => getAssets()
)

const assets = computed(() => assetsData.value ?? [])
const assetsLoading = computed(() => assetsPending.value)

// Refresh signal — `dateModified` no JSON-LD vem deste valor.
// Bump CONTENT_VERSION quando houver mudanca real na calculadora ou
// no conteudo educacional, pra forcar reindexacao no Google.
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const lastUpdatedISO = lastUpdated.toISOString()

// Rankings relacionados — pontes pra listas de DY, buy and hold e
// Bazin que continuam a jornada do user que acabou de calcular DY.
const relatedRankings = [
  {
    to: '/ranking/maiores-dividend-yield',
    icon: 'i-lucide-coins',
    title: 'Maiores DY da B3',
    sub: 'Top 50 ações e FIIs por dividend yield',
  },
  {
    to: '/ranking/buy-and-hold',
    icon: 'i-lucide-shield-check',
    title: 'Buy and Hold (score 10)',
    sub: 'Carteira otimizada pra longo prazo',
  },
  {
    to: '/ranking/mais-baratas-bazin',
    icon: 'i-lucide-tag',
    title: 'Mais baratas pelo Bazin',
    sub: 'Desconto pelo método de Décio Bazin',
  },
] as const

// ====================================================================
// Cenarios populares — long-tail SEO via deep-links.
// Cada cenario combina ticker + (opcional) preco/dividendo em URL
// canonica que o DividendYield.vue ja le no mount e dispara o calculo
// (quando ha inputs numericos suficientes pro modo). Captura queries
// "dividend yield ITUB4 calcular", "DY PETR4", "DY on cost", etc.
// ====================================================================
const popularScenarios = [
  { label: 'DY de ITUB4', sub: 'Banco Itaú', icon: 'i-lucide-landmark', to: '/calculadora/dividend-yield?ticker=ITUB4' },
  { label: 'DY de PETR4', sub: 'Petrobras', icon: 'i-lucide-fuel', to: '/calculadora/dividend-yield?ticker=PETR4' },
  { label: 'DY de BBAS3', sub: 'Banco do Brasil', icon: 'i-lucide-banknote', to: '/calculadora/dividend-yield?ticker=BBAS3' },
  { label: 'DY de TAEE11', sub: 'Taesa, transmissão', icon: 'i-lucide-zap', to: '/calculadora/dividend-yield?ticker=TAEE11' },
  { label: 'DY de KLBN11', sub: 'Klabin, papel & celulose', icon: 'i-lucide-package', to: '/calculadora/dividend-yield?ticker=KLBN11' },
  { label: 'DY de ALOS3', sub: 'Allos, shoppings', icon: 'i-lucide-store', to: '/calculadora/dividend-yield?ticker=ALOS3' },
  { label: 'DY de VALE3', sub: 'Vale, mineradora', icon: 'i-lucide-mountain', to: '/calculadora/dividend-yield?ticker=VALE3' },
  { label: 'DY de BBDC4', sub: 'Bradesco', icon: 'i-lucide-credit-card', to: '/calculadora/dividend-yield?ticker=BBDC4' },
  { label: 'DY de CMIG4', sub: 'Cemig, energia', icon: 'i-lucide-bolt', to: '/calculadora/dividend-yield?ticker=CMIG4' },
  { label: 'DY de TRPL4', sub: 'ISA Cteep, transmissão', icon: 'i-lucide-tower-control', to: '/calculadora/dividend-yield?ticker=TRPL4' },
  { label: 'DY de BRSR6', sub: 'Banrisul', icon: 'i-lucide-piggy-bank', to: '/calculadora/dividend-yield?ticker=BRSR6' },
  { label: 'DY on cost, comprou a R$ 20, vale R$ 30', sub: 'Exemplo clássico', icon: 'i-lucide-trending-up', to: '/calculadora/dividend-yield?purchase=20&current=30&div=1.50' },
  { label: 'DY de HGLG11', sub: 'CSHG Logística (FII tijolo)', icon: 'i-lucide-truck', to: '/calculadora/dividend-yield?ticker=HGLG11' },
  { label: 'DY de KNCR11', sub: 'Kinea Rendimentos (FII papel)', icon: 'i-lucide-file-text', to: '/calculadora/dividend-yield?ticker=KNCR11' },
  { label: 'DY de SNLG11', sub: 'Suno Logística (FII high-yield)', icon: 'i-lucide-warehouse', to: '/calculadora/dividend-yield?ticker=SNLG11' },
  { label: 'DY de GGRC11', sub: 'GGR Covepi (FII logística)', icon: 'i-lucide-package-2', to: '/calculadora/dividend-yield?ticker=GGRC11' },
  { label: 'DY de DIVD11', sub: 'Maxi Renda (FII alto yield)', icon: 'i-lucide-coins', to: '/calculadora/dividend-yield?ticker=DIVD11' },
] as const

// FAQs servem como fonte unica entre o HTML (renderizado nos `<details>`)
// e o FAQPage schema (mainEntity). Antes o schema tinha so 2 perguntas
// e o HTML 5 — Google ignora FAQs nao espelhados.
const faqItems = [
  {
    q: 'Qual é um bom Dividend Yield?',
    a: 'Para ações: 4-8% é considerado bom no Brasil. Menos de 3% é baixo (típico de empresas growth). Acima de 10% levanta suspeitas, pode ser ação em forte queda ou dividendo extraordinário não recorrente. Para FIIs: 8-12% é a média histórica. FIIs de papel pagam mais (9-13%) que FIIs de tijolo (8-12%). Acima de 13% num FII, investigue se é sustentável (vacância alta, distribuição de receita não recorrente).',
  },
  {
    q: 'DY alto é sempre melhor?',
    a: 'Não. DY muito alto pode indicar três armadilhas: 1) Preço da ação caiu muito por algum problema na empresa (DY virou alto matematicamente, mas o ativo está em crise); 2) Dividendo extraordinário pontual que não vai se repetir (venda de ativo, distribuição de reserva); 3) Payout insustentável, empresa distribui mais do que deveria e vai cortar dividendo no próximo ciclo. Sempre verifique payout ratio, lucro recorrente e dívida líquida antes de comprar por DY alto.',
  },
  {
    q: 'O que é Payout Ratio e qual o ideal?',
    a: 'Payout é a porcentagem do lucro líquido que a empresa distribui em dividendos. Payout = (Dividendos ÷ Lucro Líquido) × 100. Para ações: 40-60% é o ideal (a empresa equilibra dividendos com reinvestimento no negócio). Para FIIs: 95% ou mais é obrigatório por lei (Lei 8.668/93). Payout acima de 80% em ação tradicional é um sinal de alerta, qualquer queda no lucro força um corte do dividendo.',
  },
  {
    q: 'Como projetar o Dividend Yield futuro?',
    a: 'Use a fórmula: DY Futuro = (LPA × Payout × (1 + Crescimento)^n) ÷ Preço Atual. Exemplo: ação a R$ 25, LPA de R$ 3, payout 50%, crescimento de 10% a.a. DY ano 1 = (3 × 1,1 × 0,5) ÷ 25 = 6,6%. DY ano 3 = (3 × 1,1³ × 0,5) ÷ 25 = 8%. DY ano 5 = (3 × 1,1⁵ × 0,5) ÷ 25 = 9,67%. Com crescimento consistente, o DY on cost dispara, é a "máquina de juros" do Bazin.',
  },
  {
    q: 'Dividendos têm imposto de renda no Brasil?',
    a: 'Atualmente, dividendos de ações e FIIs são isentos de IR para pessoa física, é um dos grandes atrativos do mercado brasileiro. Atenção a duas exceções: 1) JCP (Juros sobre Capital Próprio) tem 15% de IR retido na fonte, mas ainda compensa porque a empresa abate como despesa e paga menos IR corporativo; 2) ganho de capital (vender mais caro do que comprou) tem IR de 15% sobre o lucro acima de R$ 20 mil/mês de vendas. Reformas tributárias podem mudar isso, sempre verifique a legislação vigente.',
  },
  {
    q: 'Como ficará a tributação de dividendos a partir de 2026?',
    a: 'O PL 1.087/2025 propõe taxar dividendos pagos a pessoa física acima de R$ 50.000 por mês a 10% retidos na fonte. Investidores que recebem menos não seriam afetados. O PL foi aprovado na Câmara em 2025 e está sendo discutido no Senado. Se aprovado, a vigência mais provável é 2027. FIIs e dividendos pagos por empresas tributadas pelo Simples Nacional ficariam isentos pelo texto atual.',
  },
  {
    q: 'Qual a diferença entre FIIs de tijolo e FIIs de papel?',
    a: 'FIIs de tijolo investem em imóveis físicos (logística, lajes corporativas, shoppings, hospitais) e geram receita via aluguel. DY típico 8-10%, valor da cota oscila com o ciclo imobiliário. FIIs de papel investem em CRIs (Certificados de Recebíveis Imobiliários) e debêntures, recebem juros. DY típico 9-13%, mais correlacionado com Selic e CDI. Uma carteira diversificada costuma ter ambos.',
  },
  {
    q: 'Qual a diferença entre DY atual e DY on cost?',
    a: 'DY atual usa o preço de mercado de hoje. DY on cost usa o seu preço de compra. Exemplo: comprou ITUB4 a R$ 18 quando pagava R$ 1,20/ano. Hoje vale R$ 30 e paga R$ 1,80/ano. DY atual = 1,80÷30 = 6%. DY on cost = 1,80÷18 = 10%. O DY on cost é o seu retorno real e tende a crescer ao longo dos anos enquanto a empresa elevar dividendos. É a métrica que importa pra investidor de longo prazo.',
  },
  {
    q: 'DY de FII e DY de ação são comparáveis?',
    a: 'Em parte. Ambos calculam dividendos sobre preço, mas são instrumentos diferentes. FIIs distribuem aluguéis ou juros recebidos (pago mensalmente, payout ~95%). Ações distribuem parte do lucro corporativo (frequência variável, payout 30-60% típico). FII de papel se compara mais com renda fixa indexada (CDI, IPCA+), enquanto FII de tijolo se compara com aluguel real. Ações de blue chip pagadoras (Itaú, Cemig, Taesa) competem mais com FIIs no perfil de renda passiva. Use sempre DY líquido (após custos) e considere volatilidade.',
  },
  {
    q: 'Quantas ações de dividendos preciso pra viver de renda?',
    a: 'Depende do gasto mensal e DY médio da carteira. Fórmula: Patrimônio = (Gasto Anual ÷ DY líquido). Exemplo: gasto de R$ 8.000/mês = R$ 96.000/ano. Carteira com DY médio de 8% líquido = R$ 1,2 milhão de patrimônio. Se for DY 6% = R$ 1,6 milhão. Se for 10% = R$ 960 mil. Reserve uma margem de segurança (15-20%) pra inflação e cortes pontuais de dividendo. Diversifique em pelo menos 10-15 pagadoras pra reduzir risco específico.',
  },
  {
    q: 'Como o crescimento dos dividendos impacta o DY on cost no longo prazo?',
    a: 'É o multiplicador silencioso. Empresas que aumentam o dividendo todo ano em ~8-10% (ex: Taesa, Itaú histórico) dobram o pagamento a cada 7-9 anos. Comprou ITUB4 a R$ 18 em 2010 com DY 6% (R$ 1,08). Em 2024 paga ~R$ 2,80, DY on cost de 15,5%. Em 20 anos vira 25%+. Por isso o segredo é comprar boas empresas no preço certo e segurar décadas, não capturar DY pontual de 12% que não cresce.',
  },
  {
    q: 'Posso usar essa calculadora para qualquer ativo?',
    a: 'Sim, a fórmula DY = Dividendos ÷ Preço funciona pra qualquer ativo gerador de renda: ações brasileiras, FIIs, ETFs (cuidado com reinvestimento automático), BDRs (cota de empresa estrangeira), até REITs americanos. Para ETFs de dividendos (DIVO11, BOVA11), considere o yield distribuído líquido. Para investimentos no exterior, lembre da tributação local + tratado de bitributação. A calculadora cobre o caso brasileiro padrão; para outros mercados, ajuste o input manualmente.',
  },
] as const

const pageTitle = `Calculadora de Dividend Yield 2026 - Grátis | ${brand.name}`
const pageDescription =
  'Calcule DY atual, projetado e on cost de qualquer ação ou FII da B3. FIIs com dividendos mensais, tributação 2026, melhores pagadores. Grátis.'

usePageSeo({
  title: pageTitle,
  description: pageDescription,
  path: '/calculadora/dividend-yield',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Dividend Yield', path: '/calculadora/dividend-yield' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `Calculadora de Dividend Yield ${brand.name}`,
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
        'Calculadora gratuita de dividend yield com 3 modos de cálculo: simples (DY atual), on cost (sobre o preço de compra) e projeção (DY futuro com LPA, payout e crescimento). Cobre ações e FIIs da B3 com pré-seleção via URL.',
      featureList: [
        'Cálculo de DY atual em tempo real',
        'DY on cost (rentabilidade sobre o preço de compra)',
        'Projeção de DY em 1 e 3 anos via LPA + payout + crescimento',
        'Busca de tickers da B3 (ações e FIIs)',
        'Análise automática (DY baixo / bom / excelente / suspeito)',
        'Cálculo de dividendos mensais e ganho total anual',
        'Cenários populares pré-preenchidos via URL (deep-link)',
        'Compatível com BDRs, ETFs e REITs (input manual)',
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

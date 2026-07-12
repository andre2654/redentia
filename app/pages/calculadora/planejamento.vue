<script setup lang="ts">
// /calculadora/planejamento — calculadora de Planejamento Patrimonial (PR10,
// fase 2). Contrato de UX: docs/redentia-nu/designs/Redentia Calculadoras
// Nu.dc.html via kit app/components/calc/* (mesma estrutura da página
// exemplar /calculadora/juros-compostos). Contrato de SEO (regra nº1): TODO
// o texto da página antiga (Frontend/app/pages/calculadora/planejamento.vue)
// verbatim, na MESMA ordem de tags (h1 → h2/h3/h4 → p → li → FAQ). Muda o
// visual, não o conteúdo. Path antigo mantido — preserva URL equity.
// Matemática: porte exato do backend antigo em
// components/calculadoras/planejamento/planning-math.ts (dados reais B3).

// Data de atualização dinâmica (sinal de frescor — portado da página antiga).
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
const lastUpdatedISO = lastUpdated.toISOString().slice(0, 10)

// Cenários populares — long-tail SEO via deep-links (texto/URLs verbatim da
// página antiga; o PlanejamentoCalcSection lê ?goal=&monthly=&strategy= e
// dispara o cálculo sozinho, igual o Planning.vue antigo).
const popularScenarios = [
  { label: 'R$ 1 milhão em 20 anos', sub: 'Aporte de R$ 1.500/mês', to: '/calculadora/planejamento?goal=1000000&monthly=1500&strategy=rentabilidade' },
  { label: 'R$ 500 mil em 10 anos', sub: 'Médio prazo, perfil agressivo', to: '/calculadora/planejamento?goal=500000&monthly=2500&strategy=rentabilidade' },
  { label: 'R$ 800 mil aposentadoria', sub: 'Carlos, 45 anos, R$ 3k/mês', to: '/calculadora/planejamento?goal=800000&monthly=3000&strategy=seguranca' },
  { label: 'R$ 150 mil entrada imóvel', sub: 'R$ 1.500/mês em 7 anos', to: '/calculadora/planejamento?goal=150000&monthly=1500&strategy=rentabilidade' },
  { label: 'R$ 300 mil em 8 anos', sub: 'Aporte de R$ 2.000/mês', to: '/calculadora/planejamento?goal=300000&monthly=2000&strategy=rentabilidade' },
  { label: 'R$ 2 milhões, perfil agressivo', sub: 'Aporte de R$ 4k/mês', to: '/calculadora/planejamento?goal=2000000&monthly=4000&strategy=rentabilidade' },
  { label: 'R$ 100 mil em 3 anos', sub: 'Reserva robusta R$ 2.500/mês', to: '/calculadora/planejamento?goal=100000&monthly=2500&strategy=seguranca' },
  { label: 'R$ 600 mil, perfil conservador', sub: 'Defensivo + renda fixa', to: '/calculadora/planejamento?goal=600000&monthly=2000&strategy=seguranca' },
  { label: 'Renda passiva R$ 5k/mês via FIIs', sub: 'Meta R$ 750k em FIIs', to: '/calculadora/planejamento?goal=750000&monthly=2500&strategy=seguranca' },
  { label: 'Patrimônio R$ 1.5M aos 50', sub: 'R$ 3k/mês começando aos 30', to: '/calculadora/planejamento?goal=1500000&monthly=3000&strategy=rentabilidade' },
  { label: 'FIRE em 15 anos', sub: 'R$ 1M com aporte agressivo', to: '/calculadora/planejamento?goal=1000000&monthly=2800&strategy=rentabilidade' },
  { label: 'Independência financeira em 25 anos', sub: 'R$ 1.5M com R$ 1.500/mês', to: '/calculadora/planejamento?goal=1500000&monthly=1500&strategy=rentabilidade' },
]

const whyCards = [
  { title: 'Clareza de Objetivos', body: 'Transforme sonhos vagos em metas concretas. "Quero ficar rico" vira "Preciso de R$ 500 mil em 15 anos investindo R$ 1.500/mês".' },
  { title: 'Estratégia Realista', body: 'Baseada em dados reais, não em otimismo exagerado. Você saberá se sua meta é viável ou se precisa ajustar aportes/prazos.' },
  { title: 'Carteira Personalizada', body: 'Receba recomendações de ativos específicos, com pesos definidos, baseadas em performance histórica e seu perfil de risco.' },
  { title: 'Acompanhamento do Progresso', body: 'Com metas claras, você pode acompanhar seu progresso mensalmente e fazer ajustes conforme necessário.' },
]

const howToSteps = [
  { title: 'Defina Sua Meta Financeira', html: 'Quanto você quer acumular? Pense em objetivos concretos: R$ 300 mil para entrada de um imóvel, R$ 1 milhão para aposentadoria, R$ 500 mil para liberdade financeira. Seja específico.' },
  { title: 'Defina Seu Aporte Mensal', html: 'Quanto você consegue investir todo mês de forma consistente? Seja realista, é melhor prometer menos e cumprir do que ser ambicioso e desistir. Lembre-se: consistência vence valor.' },
  { title: 'Escolha Sua Estratégia', html: '<strong>Maior rentabilidade:</strong> Foca em ativos que tiveram melhor desempenho histórico (maior retorno, mas maior volatilidade). <strong>Maior segurança:</strong> Prioriza ativos defensivos e inclui renda fixa para estabilidade.' },
  { title: 'Analise os Resultados', html: 'Veja quanto tempo levará para atingir sua meta, a carteira recomendada com pesos específicos de cada ativo, projeção de patrimônio e comparação com dados históricos reais.' },
  { title: 'Execute e Monitore', html: 'Use a carteira recomendada como base, adapte conforme seu conhecimento e perfil, e revise trimestralmente. Ajuste aportes se sua renda mudar.' },
]

const allocationCards = [
  { title: 'Conservador', body: '80% renda fixa + 15% FIIs + 5% ações. Foco em preservar capital, baixíssima volatilidade. Ideal pra quem está perto de usar o dinheiro ou tem aversão forte a oscilação.' },
  { title: 'Moderado', body: '50% renda fixa + 30% renda variável (ações + FIIs) + 20% internacional/ouro. Equilíbrio clássico entre crescimento e proteção. Bom default pra quem está construindo patrimônio.' },
  { title: 'Arrojado', body: '70% renda variável + 20% internacional + 10% renda fixa pra reserva. Maximiza retorno de longo prazo. Só faz sentido com horizonte de 10+ anos e tolerância real a quedas de 30-50%.' },
]

const interpretCards = [
  { title: 'Ticker e Nome', body: 'O código da ação (ex: PETR4) e nome da empresa. Use esses códigos para comprar na sua corretora.' },
  { title: 'Peso (%)', body: 'Quanto do seu aporte deve ir para cada ativo. Ex: Se você investe R$ 1.000/mês e PETR4 tem peso de 20%, deve comprar R$ 200 em PETR4 por mês.' },
  { title: 'Retorno Histórico', body: 'Quanto o ativo rendeu no período analisado. Passado não garante futuro, mas mostra o potencial.' },
  { title: 'CAGR (Retorno Anual Composto)', body: 'A taxa média anual de crescimento. É mais precisa que retorno total para comparar ativos.' },
  { title: 'Dividendos Totais', body: 'Quanto você teria recebido em proventos reinvestidos ao longo do período. Muitas vezes representa 30-50% do retorno total.' },
]

const sucessorioCards = [
  { title: 'Instrumentos clássicos', body: 'Testamento (define partilha além da regra legal), doação em vida com usufruto (você fica com a renda enquanto vivo), holding familiar (PJ que centraliza patrimônio), seguro de vida resgatável (não entra em inventário).' },
  { title: 'ITCMD e custos', body: 'ITCMD (imposto de transmissão por herança) varia de 4% a 8% conforme o estado. Holding familiar costuma render economia tributária + planejamento, mas custa R$ 5-15 mil/ano de manutenção, só faz sentido pra patrimônio acima de R$ 1 milhão.' },
]

const tipCards = [
  { title: '1. Automatize Seus Aportes', body: 'Configure transferências automáticas da sua conta para a corretora. Trate o investimento como uma conta que você DEVE pagar todo mês.' },
  { title: '2. Comece Hoje', body: 'Não espere "ter mais dinheiro" ou "estudar mais". Comece com o que você tem e aprenda fazendo. Cada mês que passa é um mês perdido de juros compostos.' },
  { title: '3. Mantenha Reserva de Emergência', body: 'Antes de investir pesado, tenha 6 meses de despesas em renda fixa líquida. Isso evita vender investimentos em emergências.' },
  { title: '4. Celebre Marcos', body: 'Ao atingir 25%, 50%, 75% da meta, celebre! Isso mantém a motivação para os próximos anos de disciplina.' },
  { title: '5. Eduque-se Continuamente', body: 'Leia sobre investimentos, acompanhe notícias econômicas, estude os ativos da sua carteira. Conhecimento reduz ansiedade e melhora decisões.' },
  { title: '6. Ajuste Quando Necessário', body: 'Se sua renda aumentar, aumente os aportes. Se sua meta mudar, refaça o planejamento. Flexibilidade é importante, mas mantenha a disciplina.' },
]

const errorCards = [
  { title: 'Metas Irrealistas', body: 'Querer R$ 1 milhão em 5 anos investindo R$ 500/mês não é viável. Use a calculadora para definir metas realistas baseadas em dados reais.' },
  { title: 'Pular Aportes Mensais', body: 'Inconsistência destrói o planejamento. Se você investe 10 meses e pula 2, perde muito do efeito composto. Seja consistente.' },
  { title: 'Vender em Pânico', body: 'Crises acontecem. Quedas de 20-30% são normais em ações. Vender em pânico cristaliza prejuízos. Mantenha a estratégia de longo prazo.' },
  { title: 'Perseguir "Dicas Quentes"', body: 'Não abandone seu planejamento para investir na "ação da vez". Especulação geralmente resulta em perdas. Siga seu plano.' },
  { title: 'Ignorar Diversificação', body: 'Concentrar tudo em 1-2 ações é extremamente arriscado. Diversifique entre setores e tipos de ativos como recomendado.' },
]

const relatedRankings = [
  { to: '/ranking/buy-and-hold', title: 'Buy and Hold (carteira otimizada)', sub: 'Score Redent pra horizonte longo' },
  { to: '/ranking/maior-potencial-upside', title: 'Maior potencial de upside', sub: 'Consenso de analistas vs preço atual' },
  { to: '/ranking/maiores-roe', title: 'Maiores ROEs', sub: 'Empresas mais rentáveis sobre o equity' },
]

// FAQs verbatim da página antiga (16). O FAQPage JSON-LD é emitido pelo
// NuFaqAccordion — fonte única, mesmo padrão do app antigo (MoleculesFAQ).
const faqItems = [
  { q: 'A carteira recomendada é garantida de funcionar?', a: 'Não há garantias no mercado financeiro. A carteira é baseada em performance histórica real da B3, mas o futuro pode ser diferente. Use como ponto de partida, faça sua própria análise dos ativos e adapte conforme seu conhecimento e perfil de risco. Sempre diversifique e invista apenas o que você pode deixar investido no longo prazo.' },
  { q: 'Devo seguir a carteira exatamente como recomendada?', a: 'Use como referência, não como lei absoluta. Se você já possui alguns ativos, considere-os no planejamento. Se algum ativo recomendado não te agrada ou você não conhece bem, substitua por similar do mesmo setor. O importante é manter a diversificação entre setores e não concentrar demais em poucos ativos. Os pesos podem variar ±5-10% sem grande impacto.' },
  { q: 'Com que frequência devo revisar meu planejamento?', a: 'Revise seu planejamento a cada 6-12 meses, ou quando houver mudanças significativas (aumento de renda, mudança de meta, crise no mercado). Evite ficar alterando a carteira constantemente, isso gera custos e pode prejudicar o crescimento de longo prazo. Pequenas oscilações são normais e esperadas. Foque em manter a disciplina dos aportes mensais.' },
  { q: 'O que fazer se eu não conseguir atingir minha meta no prazo desejado?', a: 'Você tem três opções: 1) Aumentar o aporte mensal, 2) Estender o prazo (mais tempo = mais juros compostos), 3) Reduzir a meta. Muitas vezes, aumentar o aporte em 20-30% pode encurtar o prazo em anos. Alternativamente, trabalhar mais 2-3 anos pode permitir você atingir uma meta maior. Seja realista e escolha o que cabe no seu orçamento e planos de vida.' },
  { q: 'Qual a diferença entre retorno total e CAGR?', a: 'Retorno total é quanto o ativo cresceu no período todo (ex: 150% em 10 anos). CAGR (Compound Annual Growth Rate) é a taxa média anual que geraria o mesmo resultado (ex: 9,6% a.a.). CAGR é melhor para comparar ativos porque normaliza pelo tempo. Um ativo com 100% em 2 anos (41% a.a.) é melhor que 150% em 10 anos (9,6% a.a.), mesmo tendo retorno total menor.' },
  { q: 'Posso usar o planejamento para aposentadoria ou FIRE?', a: 'Sim, é o uso clássico da calculadora. Para renda passiva mensal, divida a meta por 150 (regra conservadora: 0,67% a.m. = 8% a.a.). Ex: meta de R$ 1 milhão geraria cerca de R$ 6.600/mês. Se precisa de R$ 5.000/mês, sua meta é aproximadamente R$ 750 mil. Para FIRE (independência financeira antecipada), use a regra dos 25x: multiplique seu gasto anual desejado por 25. Nos últimos 5-10 anos antes da aposentadoria, migre gradualmente para estratégia de segurança.' },
  { q: 'Como o planejamento considera crises e quedas de mercado?', a: 'Nosso planejamento usa dados históricos reais que incluem crises (2008, 2015-2016, 2020). Os ativos recomendados já passaram por períodos difíceis e se recuperaram. Por isso os retornos projetados são realistas, não otimistas. Crises futuras podem ser diferentes. Mantenha sempre uma reserva de emergência fora dos investimentos e não entre em pânico vendendo em quedas, historicamente, quem manteve investido se recuperou.' },
  { q: 'Preciso rebalancear a carteira periodicamente?', a: 'Sim, mas não com muita frequência. A cada 6-12 meses, verifique se os pesos dos ativos ainda estão próximos do planejado. Se um ativo valorizou muito e agora representa 35% da carteira quando deveria ser 20%, venda um pouco e reforce ativos que ficaram abaixo do peso. Ou simplesmente direcione novos aportes para os ativos que estão abaixo do peso ideal. Evite rebalancear a cada mês, gera custos desnecessários.' },
  { q: 'Devo incluir imóveis no planejamento patrimonial?', a: 'Imóveis físicos são ilíquidos e difíceis de precificar, então nossa calculadora não os inclui. Você pode investir em Fundos Imobiliários (FIIs), que têm liquidez, diversificação e pagam dividendos mensais. FIIs entram nas carteiras recomendadas. Se você já tem imóveis próprios, considere-os como parte do patrimônio total e foque os investimentos em ações e FIIs para diversificação.' },
  { q: 'Quanto da minha renda devo investir mensalmente?', a: 'Uma regra comum é 20-30% da renda líquida, mínimo de 10%. Depende da sua situação: idade, dependentes, custo de vida, dívidas. Se você ganha R$ 5.000, investir R$ 500-1.500/mês é razoável. Comece com o que é confortável e aumente gradualmente. O mais importante é a consistência: melhor investir R$ 300/mês todo mês do que R$ 1.000 de forma irregular. Comece agora, mesmo que com pouco.' },
  { q: 'Qual a diferença entre estratégia de rentabilidade e segurança?', a: 'Rentabilidade prioriza ativos com melhor performance histórica (80-90% ações + 10-20% FIIs), com retorno médio de 14-18% a.a. e maior volatilidade, ideal para horizontes de 10+ anos. Segurança mistura defensivos (50-60% bancos/energia/saneamento), 30-40% FIIs e 10% renda fixa, com retorno de 10-13% a.a. e menor oscilação, ideal para horizontes de 5-10 anos ou perfil conservador.' },
  { q: 'Como compartilhar uma simulação específica de planejamento?', a: 'Basta copiar a URL com os parâmetros: https://redentia.com.br/calculadora/planejamento?goal=500000&monthly=1500&strategy=rentabilidade já abre a calculadora preenchida e calcula automaticamente a carteira sugerida. Útil pra mandar para o cônjuge, planejador financeiro ou salvar a meta nos favoritos.' },
  { q: 'O que é asset allocation e por que importa?', a: 'Asset allocation é a distribuição percentual da carteira entre classes de ativos (renda fixa, ações, FIIs, internacional, ouro). O estudo clássico Brinson (1986) mostra que 90% da variação de retorno de longo prazo vem da ALOCAÇÃO, não da escolha de ativos individuais. Por isso decidir "quanto em cada classe" é mais importante que "qual ação comprar". Exemplo: 60% renda variável + 40% renda fixa é moderado clássico.' },
  { q: 'Quando faz sentido fazer planejamento sucessório?', a: 'Quando o patrimônio passa de R$ 500.000, você tem múltiplos herdeiros, ou conduz atividade empresarial. Instrumentos: testamento (define partilha), doação em vida com usufruto (você fica com renda enquanto vivo), holding familiar (PJ que centraliza ativos, economiza ITCMD), seguro de vida resgatável (não entra em inventário). ITCMD varia 4-8% por estado.' },
  { q: 'O que é uma holding familiar?', a: 'É uma empresa (geralmente Ltda) criada pra centralizar o patrimônio da família. Vantagens: planejamento sucessório (cotas se transferem por procuração simples, sem inventário), economia de ITCMD (em alguns estados), proteção patrimonial (em casos específicos). Custos: R$ 5-15k/ano de contabilidade + ITBI/ITCMD na transferência inicial. Só vale a pena pra patrimônio acima de R$ 1 milhão.' },
  { q: 'Qual a diferença entre planejamento patrimonial e financeiro?', a: 'Planejamento financeiro foca no curto-médio prazo (orçamento, dívidas, reserva de emergência, primeiros investimentos). Planejamento patrimonial é mais amplo: estratégia de longo prazo pra construir e GERIR um patrimônio relevante (asset allocation, diversificação, sucessão). Toda pessoa deveria ter um planejamento financeiro; planejamento patrimonial vira relevante a partir de R$ 200-500k em ativos.' },
]

usePageSeo({
  title: 'Planejamento Patrimonial 2026 - Carteira B3',
  description:
    'Carteira recomendada da B3 pra atingir R$ 500 mil, R$ 1 milhão ou liberdade financeira. Asset allocation por perfil + planejamento sucessório. Grátis.',
  path: '/calculadora/planejamento',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadoras' },
    { name: 'Planejamento Patrimonial', path: '/calculadora/planejamento' },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: 'Calculadora de Planejamento Patrimonial Redentia',
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Planejamento patrimonial',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
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
    // FAQPage schema é emitido pelo <NuFaqAccordion> via useHead — fonte única.
  ],
})
</script>

<template>
  <div>
    <!-- ============ Hero (texto antigo verbatim, visual Nu) ============ -->
    <section class="pl__hero">
      <div class="pl__status">
        <NuxtLink to="/calculadoras" class="pl__back">← Todas as calculadoras</NuxtLink>
        <span aria-hidden>·</span>
        <span>Atualizado {{ lastUpdatedText }}</span>
      </div>
      <p class="pl__eyebrow">Calculadora · Planejamento Patrimonial</p>
      <h1 class="pl__h1">
        Caminho para a liberdade
        <em class="pl__italic">financeira.</em>
      </h1>
      <p class="pl__lead">
        Esta calculadora monta uma carteira recomendada da B3 com base em <strong>dados históricos reais</strong> pra atingir sua meta. Define meta + aporte mensal + estratégia (rentabilidade ou segurança), retorna 5-10 ativos com pesos específicos e projeção de quando você atinge o objetivo. Exemplo: meta de R$ 1 milhão com R$ 2.000/mês na estratégia rentabilidade leva ~18 anos.
      </p>
      <ul class="pl__chips">
        <li><span class="pl__chip-dot pl__chip-dot--positive" /> 100% gratuito</li>
        <li><span class="pl__chip-dot" /> Cálculo instantâneo</li>
        <li><span class="pl__chip-dot" /> Carteira sugerida com pesos</li>
        <li><span class="pl__chip-dot" /> Dados históricos reais B3</li>
      </ul>
    </section>

    <!-- ============ Calculadora interativa (design + matemática antiga) ============ -->
    <PlanejamentoCalcSection section-id="planejamento">
      <template #title>Planejamento patrimonial.</template>
    </PlanejamentoCalcSection>

    <!-- ============ Cenários populares (deep-links, texto verbatim) ============ -->
    <CalcBand tone="cream" title="Cenários populares de planejamento">
      <template #dek>
        <p>Veja na hora a carteira sugerida e o tempo até a meta dos cenários mais buscados, basta clicar e a simulação carrega já preenchida.</p>
      </template>
      <div class="pl__scenarios">
        <NuxtLink v-for="s in popularScenarios" :key="s.label" :to="s.to" class="pl__scenario">
          <span class="pl__scenario-label">{{ s.label }}</span>
          <span class="pl__scenario-sub">{{ s.sub }}</span>
        </NuxtLink>
      </div>
    </CalcBand>

    <!-- ============ Conteúdo educacional (texto verbatim, bandas do design) ============ -->
    <CalcSplit tone="white">
      <template #title>Simulador de Planejamento Patrimonial grátis e online</template>
      <template #left>
        <h2 class="pl__sub">O que é Planejamento Patrimonial?</h2>
      </template>
      <div class="pl__prose">
        <p>Planejamento patrimonial é o processo de definir metas financeiras claras e criar uma estratégia concreta para alcançá-las. Não basta apenas "investir", você precisa saber exatamente quanto investir, por quanto tempo, e em quais ativos, para realizar seus objetivos.</p>
        <p>Nossa calculadora vai além de simulações genéricas: ela analisa dados históricos reais de centenas de ativos da B3, monta uma carteira otimizada para seu perfil, e projeta quando você atingirá sua meta. Tudo baseado em performance real, não em promessas.</p>
      </div>
    </CalcSplit>

    <CalcBand tone="cream" title-tag="h3" title="Por que Fazer um Planejamento Patrimonial?">
      <div class="pl__tiles">
        <div v-for="c in whyCards" :key="c.title" class="pl__tile">
          <h4 class="pl__h4 pl__h4--accent">{{ c.title }}</h4>
          <p class="pl__card-p">{{ c.body }}</p>
        </div>
      </div>
    </CalcBand>

    <CalcSplit tone="white">
      <template #title>Reserva de Emergência: Pré-requisito do Planejamento</template>
      <div class="pl__prose">
        <p>Antes de qualquer estratégia patrimonial, monte uma reserva de emergência. Quanto: 6 a 12 meses do seu custo de vida (autônomo ou renda variável: 12 meses; CLT estável: 6 meses). Onde guardar: Tesouro Selic 2030, CDB com liquidez diária de banco grande (FGC até R$ 250 mil), conta remunerada como Nubank, Inter ou C6 que rende ~100% do CDI.</p>
        <p>Por que: pra não precisar vender investimentos de longo prazo no pior momento (queda de bolsa, mercado em pânico). Exemplo prático: se você gasta R$ 4 mil/mês, sua reserva é R$ 24-48 mil. Se gasta R$ 8 mil/mês, fica entre R$ 48-96 mil. Sem essa proteção, qualquer evento inesperado (saúde, demissão, conserto grande) vira motivo pra cristalizar prejuízo.</p>
      </div>
    </CalcSplit>

    <!-- ============ Como usar (anatomia EXATA do design: banda creme + card branco de steps) ============ -->
    <CalcBand tone="cream" title="Como Usar a Calculadora de Planejamento">
      <div class="pl__band-body"><CalcSteps :steps="howToSteps" /></div>
    </CalcBand>

    <!-- ============ Asset allocation (split: título gigante + prosa e tiles à direita) ============ -->
    <CalcSplit tone="white">
      <template #title>Asset Allocation: Alocação de Ativos por Perfil</template>
      <div class="pl__prose">
        <p>Asset allocation é a distribuição percentual da carteira entre classes de ativos: ações, FIIs, renda fixa, ouro, internacional. A decisão estratégica de "quanto em cada classe" pesa mais que qual ativo individual escolher dentro da classe.</p>
        <p>Por que importa: o estudo clássico de Brinson, Hood e Beebower (1986) mostra que cerca de 90% da variação de retorno de longo prazo de uma carteira vem da alocação entre classes, NÃO da escolha de ativos individuais. Ou seja, decidir 60% renda variável + 40% renda fixa importa mais que escolher entre ITUB4 ou BBDC4 dentro da fatia de ações.</p>
      </div>
      <div class="pl__tiles pl__tiles--split">
        <div v-for="c in allocationCards" :key="c.title" class="pl__tile">
          <h4 class="pl__h4 pl__h4--accent">{{ c.title }}</h4>
          <p class="pl__card-p">{{ c.body }}</p>
        </div>
      </div>
    </CalcSplit>

    <!-- ============ Estratégias (banda creme, cards brancos com título h3) ============ -->
    <CalcBand tone="cream" title="Estratégias de Planejamento">
      <div class="pl__ex-grid">
        <div>
          <h3 class="pl__ex-title">Maior Rentabilidade</h3>
          <div class="pl__ex-card">
            <h4 class="pl__h4 pl__h4--positive">
              Para quem: Investidores com tolerância a risco e horizonte longo (10+ anos)
            </h4>
            <p class="pl__card-p">
              Esta estratégia seleciona ativos com melhor performance histórica, priorizando crescimento de capital. Pode ter maior volatilidade no curto prazo, mas tende a maximizar retornos no longo prazo.
            </p>
            <p class="pl__card-p pl__card-p--strong">Características:</p>
            <ul class="pl__list pl__list--plain">
              <li>• 80-90% em ações de alto crescimento e blue chips</li>
              <li>• 10-20% em FIIs consolidados</li>
              <li>• Foco em setores com boas perspectivas futuras</li>
              <li>• Maior exposição a small caps de qualidade</li>
              <li>• Retorno histórico médio: 14-18% a.a.</li>
            </ul>
          </div>
        </div>
        <div>
          <h3 class="pl__ex-title">Maior Segurança</h3>
          <div class="pl__ex-card">
            <h4 class="pl__h4 pl__h4--accent">
              Para quem: Investidores conservadores ou próximos de usar o dinheiro (5-10 anos)
            </h4>
            <p class="pl__card-p">
              Esta estratégia prioriza estabilidade e previsibilidade. Seleciona empresas consolidadas, setores defensivos e inclui renda fixa para reduzir volatilidade.
            </p>
            <p class="pl__card-p pl__card-p--strong">Características:</p>
            <ul class="pl__list pl__list--plain">
              <li>• 50-60% em ações de setores defensivos (bancos, energia, saneamento)</li>
              <li>• 30-40% em FIIs consolidados e diversificados</li>
              <li>• 10% em renda fixa (Tesouro Direto, CDBs)</li>
              <li>• Foco em pagadores consistentes de dividendos</li>
              <li>• Retorno histórico médio: 10-13% a.a.</li>
            </ul>
          </div>
        </div>
      </div>
    </CalcBand>

    <!-- ============ Exemplos de metas (banda branca, cards creme com título h3) ============ -->
    <CalcBand tone="white" title="Exemplos de Metas e Resultados">
      <div class="pl__ex-grid">
        <div>
          <h3 class="pl__ex-title">Exemplo 1: Aposentadoria Antecipada</h3>
          <div class="pl__ex-card">
            <h4 class="pl__h4">João, 30 anos - Meta: R$ 1 milhão</h4>
            <ul class="pl__list">
              <li>Aporte mensal: R$ 2.000</li>
              <li>Estratégia: Maior rentabilidade</li>
              <li>Horizonte: 20 anos</li>
            </ul>
            <div class="pl__result-box">
              <p class="pl__result-main">Resultado: Alcança meta em aproximadamente 18 anos</p>
              <p class="pl__result-sub">Total investido: R$ 432.000 | Ganho projetado: R$ 568.000</p>
              <p class="pl__result-sub">Carteira sugerida: 40% ITUB4, 20% VALE3, 15% WEGE3, 15% PETR4, 10% BBDC4</p>
            </div>
          </div>
        </div>
        <div>
          <h3 class="pl__ex-title">Exemplo 2: Entrada de Imóvel</h3>
          <div class="pl__ex-card">
            <h4 class="pl__h4">Maria, 25 anos - Meta: R$ 150.000</h4>
            <ul class="pl__list">
              <li>Aporte mensal: R$ 1.500</li>
              <li>Estratégia: Maior rentabilidade</li>
              <li>Horizonte: 7 anos</li>
            </ul>
            <div class="pl__result-box">
              <p class="pl__result-main">Resultado: Alcança meta em aproximadamente 6,5 anos</p>
              <p class="pl__result-sub">Total investido: R$ 117.000 | Ganho projetado: R$ 33.000</p>
              <p class="pl__result-sub">Carteira sugerida: 35% PETR4, 25% VALE3, 20% BBDC4, 20% WEGE3</p>
            </div>
          </div>
        </div>
        <div>
          <h3 class="pl__ex-title">Exemplo 3: Renda Passiva para Aposentadoria</h3>
          <div class="pl__ex-card">
            <h4 class="pl__h4">Carlos, 45 anos - Meta: R$ 800.000</h4>
            <ul class="pl__list">
              <li>Aporte mensal: R$ 3.000</li>
              <li>Estratégia: Maior segurança</li>
              <li>Horizonte: 15 anos (aposentar aos 60)</li>
            </ul>
            <div class="pl__result-box">
              <p class="pl__result-main">Resultado: Alcança meta em aproximadamente 14 anos</p>
              <p class="pl__result-sub">Total investido: R$ 540.000 | Ganho projetado: R$ 260.000</p>
              <p class="pl__result-sub">Carteira sugerida: 30% FIIs diversos, 25% ITUB4, 20% BBDC4, 15% PETR4, 10% Renda Fixa</p>
              <p class="pl__result-sub">Com R$ 800 mil gerando 10% a.a., terá R$ 6.600/mês de renda passiva</p>
            </div>
          </div>
        </div>
      </div>
    </CalcBand>

    <!-- ============ Como interpretar (banda creme centrada + tiles brancos) ============ -->
    <CalcBand tone="cream" title="Como Interpretar a Carteira Recomendada">
      <template #dek>
        <p>A carteira recomendada mostra ativos específicos e seus pesos sugeridos. Veja o que cada informação significa:</p>
      </template>
      <div class="pl__tiles">
        <div v-for="c in interpretCards" :key="c.title" class="pl__tile">
          <h4 class="pl__h4 pl__h4--accent">{{ c.title }}</h4>
          <p class="pl__card-p">{{ c.body }}</p>
        </div>
      </div>
    </CalcBand>

    <!-- ============ Patrimonial vs sucessório (split: prosa + tiles à direita) ============ -->
    <CalcSplit tone="white">
      <template #title>Planejamento Patrimonial vs Planejamento Sucessório</template>
      <div class="pl__prose">
        <p>Os dois conceitos são complementares mas têm focos distintos. Planejamento patrimonial foca em ACUMULAR e GERIR riqueza durante a vida ativa do investidor, escolha de ativos, asset allocation, otimização tributária. Planejamento sucessório foca em TRANSMITIR esse patrimônio aos herdeiros com mínimo de impostos e mínimo de conflito, é uma camada que entra em cena quando o patrimônio começa a ficar relevante.</p>
        <p>Quando faz sentido planejar a sucessão: patrimônio acima de R$ 500 mil, múltiplos herdeiros, atividade empresarial em andamento, ou casamento em comunhão de bens com complexidades familiares.</p>
      </div>
      <div class="pl__tiles pl__tiles--split">
        <div v-for="c in sucessorioCards" :key="c.title" class="pl__tile">
          <h4 class="pl__h4 pl__h4--accent">{{ c.title }}</h4>
          <p class="pl__card-p">{{ c.body }}</p>
        </div>
      </div>
    </CalcSplit>

    <!-- ============ FAQ (anatomia EXATA do design: banda creme, cards brancos, pill IA) ============ -->
    <CalcSplit tone="cream" wide>
      <template #title>Perguntas Frequentes</template>
      <template #left>
        <NuxtLink to="/busca" class="pl__pill">Perguntar à Redentia AI</NuxtLink>
      </template>
      <NuFaqAccordion :items="faqItems" surface="white" />
    </CalcSplit>

    <!-- ============ Dicas (banda branca, tiles creme) ============ -->
    <CalcBand tone="white" title="Dicas para Executar Seu Planejamento">
      <div class="pl__tiles">
        <div v-for="c in tipCards" :key="c.title" class="pl__tile">
          <h4 class="pl__h4 pl__h4--accent">{{ c.title }}</h4>
          <p class="pl__card-p">{{ c.body }}</p>
        </div>
      </div>
    </CalcBand>

    <!-- ============ Erros comuns (banda creme, tiles brancos com h4 negativo) ============ -->
    <CalcBand tone="cream" title="Erros Comuns a Evitar">
      <div class="pl__tiles">
        <div v-for="c in errorCards" :key="c.title" class="pl__tile">
          <h4 class="pl__h4 pl__h4--negative">{{ c.title }}</h4>
          <p class="pl__card-p">{{ c.body }}</p>
        </div>
      </div>
    </CalcBand>

    <!-- ============ Rankings + outras ferramentas + CTA ============ -->
    <CalcBand tone="white" title="Rankings Relacionados">
      <template #dek>
        <p>Explore listas atualizadas diariamente com os melhores ativos da B3 para complementar sua análise.</p>
      </template>
      <div class="pl__grid-cards">
        <NuxtLink v-for="r in relatedRankings" :key="r.to" :to="r.to" class="pl__card-link">
          <h3 class="pl__card-link-title">{{ r.title }}</h3>
          <p class="pl__card-p">{{ r.sub }}</p>
        </NuxtLink>
      </div>
    </CalcBand>

    <CalcBand tone="cream" title="Outras Ferramentas">
      <div class="pl__grid-cards">
        <NuxtLink to="/calculadora/juros-compostos" class="pl__card-link">
          <h3 class="pl__card-link-title">Calculadora de Juros Compostos</h3>
          <p class="pl__card-p">Simule investimentos com taxas fixas</p>
        </NuxtLink>
        <NuxtLink to="/calculadora/acoes" class="pl__card-link">
          <h3 class="pl__card-link-title">Simulador de Ações</h3>
          <p class="pl__card-p">Analise histórico real de ativos da B3</p>
        </NuxtLink>
      </div>

      <div class="pl__cta">
        <h2 class="pl__cta-title">Acompanhe seu progresso na Redentia</h2>
        <p class="pl__cta-sub">Crie sua conta e monitore sua carteira real, receba alertas personalizados e análises com IA.</p>
        <div class="pl__cta-actions">
          <NuxtLink to="/login" class="pl__pill pl__pill--light">Criar conta grátis</NuxtLink>
          <NuxtLink to="/guias" class="pl__pill pl__pill--outline">Ver mais guias</NuxtLink>
        </div>
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
/* ——— hero ——— */
.pl__hero {
  background: var(--nu-cream);
  padding: clamp(48px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px) clamp(40px, 5vw, 64px);
  animation: nu-fade .5s ease both;
}
.pl__status {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  color: var(--nu-gray); font-size: 13.5px; font-weight: 600; margin-bottom: 22px;
}
.pl__back { color: var(--nu-blue); font-weight: 800; }
.pl__back:hover { color: var(--nu-blue-hover); }
.pl__eyebrow { margin: 0; color: var(--nu-blue); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800; }
.pl__h1 {
  margin: 12px 0 0; color: var(--nu-ink);
  font-size: clamp(34px, 4.6vw, 64px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.04; max-width: 1080px;
}
.pl__italic { font-style: italic; }
.pl__lead {
  color: var(--nu-gray-2); font-size: clamp(16px, 1.7vw, 19px); font-weight: 500;
  line-height: 1.6; margin: 20px 0 0; max-width: 780px;
}
.pl__lead strong { color: var(--nu-ink); font-weight: 800; }
.pl__chips { list-style: none; display: flex; gap: 10px; flex-wrap: wrap; margin: 26px 0 0; padding: 0; }
.pl__chips li {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 9px 15px; color: var(--nu-ink); font-size: 13.5px; font-weight: 700;
}
.pl__chip-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--nu-blue); flex-shrink: 0; }
.pl__chip-dot--positive { background: var(--nu-green); }

/* ——— tipografia compartilhada ——— */
.pl__h4 { margin: 0 0 8px; color: var(--nu-ink); font-size: 16.5px; font-weight: 800; letter-spacing: -.2px; }
.pl__h4--accent { color: var(--nu-blue); }
.pl__h4--positive { color: var(--nu-green); }
.pl__h4--negative { color: var(--nu-red); }

/* ——— prosa da coluna direita (bandas split do design) ——— */
.pl__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: 17px; font-weight: 500;
  line-height: 1.7;
}
.pl__prose p:last-child { margin-bottom: 0; }

/* ——— sub-heading dentro da coluna esquerda do split ——— */
.pl__sub { margin: clamp(24px, 3vw, 34px) 0 0; color: var(--nu-ink); font-size: 20px; font-weight: 800; letter-spacing: -.3px; }

/* ——— corpo de banda centrada (card 1080 do design) ——— */
.pl__band-body { margin-top: clamp(30px, 4vw, 48px); }

/* ——— cenários populares ——— */
.pl__scenarios {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px; margin-top: clamp(24px, 3.5vw, 36px);
}
.pl__scenario {
  background: var(--nu-white); border-radius: var(--nu-r-tile); padding: 16px 18px;
  display: flex; flex-direction: column; gap: 3px;
  transition: transform .18s, box-shadow .2s;
}
.pl__scenario:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.pl__scenario-label { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; letter-spacing: -.1px; }
.pl__scenario-sub { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }

/* ——— tiles (grid de cards pequenos, mesma família do exemplar) ——— */
.pl__tiles {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 1080px; margin-left: auto; margin-right: auto;
}
.pl__tiles--split {
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  max-width: none; margin-top: 0;
}
.pl__prose + .pl__tiles { margin-top: clamp(20px, 3vw, 28px); }
.pl__tile { background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 24px; }
/* regra .cbd--cream: tile branco em banda creme (":global(x) y" compila errado
   neste setup — descendente é dropado — então fica o descendente scoped puro,
   que casa porque só o último elemento do seletor recebe o data-v). */
.cbd--cream .pl__tile { background: var(--nu-white); }
.pl__card-p { margin: 6px 0 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }
.pl__card-p--strong { color: var(--nu-ink); font-weight: 700; margin-top: 14px; }
.pl__list { margin: 8px 0 0; padding-left: 18px; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.7; }
.pl__list--plain { list-style: none; padding-left: 0; }
.pl__result-box { background: var(--nu-blue-tint); border-radius: var(--nu-r-input); padding: 14px 16px; margin-top: 14px; }
.pl__result-main { margin: 0; color: var(--nu-ink); font-size: 15px; font-weight: 800; }
.pl__result-sub { margin: 4px 0 0; color: var(--nu-gray-2); font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums; }

/* ——— ex-grid (cards com título h3 acima, família dos exemplos do exemplar) ——— */
.pl__ex-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr));
  gap: 18px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 1080px; margin-left: auto; margin-right: auto;
}
.pl__ex-title { margin: 0 0 14px; color: var(--nu-ink); font-size: 19px; font-weight: 800; letter-spacing: -.2px; }
.pl__ex-card { background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 26px; }
.cbd--cream .pl__ex-card { background: var(--nu-white); }

/* ——— cards-link (rankings / outras ferramentas) ——— */
.pl__grid-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 980px; margin-left: auto; margin-right: auto;
}
.pl__card-link {
  background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 26px;
  display: flex; flex-direction: column; gap: 6px;
  transition: transform .18s, box-shadow .2s;
}
.cbd--cream .pl__card-link { background: var(--nu-white); }
.pl__card-link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.pl__card-link-title { margin: 0; color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -.2px; }

/* ——— pills / CTA ——— */
.pl__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.pl__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.pl__cta {
  background: var(--nu-blue); border-radius: var(--nu-r-card-lg);
  padding: clamp(34px, 5vw, 60px); text-align: center; margin-top: clamp(44px, 6vw, 72px);
  max-width: 1080px; margin-left: auto; margin-right: auto;
}
.pl__cta-title { margin: 0; color: var(--nu-white); font-size: clamp(26px, 3.4vw, 44px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.pl__cta-sub { margin: 14px auto 0; color: var(--nu-white-75); font-size: 16px; font-weight: 500; line-height: 1.6; max-width: 560px; }
.pl__cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 26px; }
.pl__cta .pl__pill { margin-top: 0; }
.pl__pill--light { background: var(--nu-cream); color: var(--nu-blue); }
.pl__pill--light:hover { background: var(--nu-white); color: var(--nu-blue-hover); }
.pl__pill--outline { background: transparent; border: 2px solid var(--nu-white-35); color: var(--nu-white); }
.pl__pill--outline:hover { background: var(--nu-white-14); color: var(--nu-white); }
</style>

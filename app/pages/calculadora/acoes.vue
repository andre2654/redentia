<script setup lang="ts">
// /calculadora/acoes — simulador de investimento em ações (PR10, fase 2).
// Contrato de UX: docs/redentia-nu/designs/Redentia Calculadoras Nu.dc.html
// (kit da fase 1: CalcShell + sliders + número-herói + gráfico + steps + FAQ).
// Contrato de SEO (regra nº1): TODO o texto da página antiga
// (Frontend/app/pages/calculadora/acoes.vue) verbatim, na MESMA ordem de tags
// (h1 → h2/h3/h4 → p → li → tabela → FAQ). Muda o visual, não o conteúdo.
// Path antigo mantido (/calculadora/acoes) — preserva URL equity e deep-links
// (?initial=&monthly=&years=&reinvest=&tickers=), lidos pelo simulador.

// Data de atualização dinâmica (sinal de frescor — portado da página antiga).
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
const lastUpdatedISO = lastUpdated.toISOString().slice(0, 10)

// Cenários populares — long-tail SEO via deep-links (texto/URLs verbatim).
const popularScenarios = [
  { label: 'ITUB4 + dividendos 10 anos', sub: 'R$ 10k inicial + R$ 500/mês', to: '/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=ITUB4' },
  { label: 'Carteira blue chips 5 anos', sub: 'ITUB4, VALE3, PETR4', to: '/calculadora/acoes?initial=15000&monthly=900&years=5&reinvest=1&tickers=ITUB4,VALE3,PETR4' },
  { label: 'PETR4 puro 5 anos', sub: 'Petrobras com dividendos', to: '/calculadora/acoes?initial=10000&monthly=500&years=5&reinvest=1&tickers=PETR4' },
  { label: 'VALE3, 10 anos com dividendos', sub: 'Mineração na carteira', to: '/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=VALE3' },
  { label: 'Carteira FIIs (HGLG11, KNCR11)', sub: 'Renda passiva mensal', to: '/calculadora/acoes?initial=10000&monthly=600&years=5&reinvest=1&tickers=HGLG11,KNCR11' },
  { label: 'BBDC4, banco com dividendos', sub: 'Bradesco 10 anos', to: '/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=BBDC4' },
  { label: 'Carteira diversificada 20% cada', sub: 'ITUB4, VALE3, PETR4, WEGE3, BBDC4', to: '/calculadora/acoes?initial=20000&monthly=1000&years=10&reinvest=1&tickers=ITUB4,VALE3,PETR4,WEGE3,BBDC4' },
  { label: 'Top dividendos 10 anos', sub: 'TAEE11 + BBSE3', to: '/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=TAEE11,BBSE3' },
  { label: 'MGLU3 vs ITUB4', sub: 'Growth vs value 5 anos', to: '/calculadora/acoes?initial=10000&monthly=500&years=5&reinvest=1&tickers=MGLU3,ITUB4' },
  { label: 'WEGE3 puro, 10 anos', sub: 'Indústria com forte crescimento', to: '/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=WEGE3' },
  { label: 'Tesouro vs Bolsa', sub: 'R$ 500/mês comparativo', to: '/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=BOVA11' },
  { label: 'Carteira small caps', sub: 'Setor de crescimento agressivo', to: '/calculadora/acoes?initial=10000&monthly=600&years=5&reinvest=1&tickers=SMAL11' },
  { label: 'BBAS3, banco estatal 10 anos', sub: 'Banco do Brasil DY 8-12%', to: '/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=BBAS3' },
  { label: 'ABEV3 defensiva 10 anos', sub: 'Ambev, dividendos previsíveis', to: '/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=ABEV3' },
]

const whyCards = [
  { title: 'Aprender com o Passado', body: 'Entenda como diferentes ações se comportaram em crises, recuperações e momentos de euforia. O passado não garante o futuro, mas ensina muito.' },
  { title: 'Testar Estratégias', body: 'Compare diferentes abordagens: aporte único vs aportes mensais, reinvestir dividendos vs sacar, concentrar em poucas ações vs diversificar.' },
  { title: 'Avaliar Dividendos', body: 'Veja o impacto real dos dividendos no retorno total. Muitas vezes, proventos representam 30-50% do ganho total em ações de qualidade.' },
  { title: 'Comparar Ativos', body: 'Simule múltiplos ativos simultaneamente e compare o desempenho. Descubra quais setores e empresas performaram melhor.' },
]

const howToSteps = [
  { title: 'Selecione as Ações', html: 'Use a busca para encontrar ações (ex: PETR4, VALE3, ITUB4) ou FIIs que você quer analisar. Você pode adicionar múltiplos ativos para comparação.' },
  { title: 'Defina o Valor Inicial', html: 'Insira quanto você teria investido inicialmente. Se você adicionar múltiplas ações, o valor será dividido igualmente entre elas.' },
  { title: 'Configure Aportes Mensais', html: 'Defina se você faria aportes mensais e de quanto. O simulador comprará ações a cada mês pelos preços reais históricos.' },
  { title: 'Escolha o Período', html: 'Selecione quantos anos você quer simular. Períodos mais longos mostram melhor o poder do tempo no mercado.' },
  { title: 'Reinvestir Dividendos', html: 'Marque esta opção para reinvestir automaticamente todos os dividendos e JCP recebidos. Isso acelera muito o crescimento patrimonial.' },
]

const proventoCards = [
  { title: 'Dividendos', body: 'Distribuição de lucro líquido. Isentos de IR. Pagos periodicamente por empresas lucrativas.' },
  { title: 'Juros sobre Capital Próprio (JCP)', body: 'Remuneração aos acionistas que a empresa pode deduzir do IR. Tem 15% de IR retido na fonte, mas ainda assim vantajoso.' },
  { title: 'Bonificações', body: 'Novas ações distribuídas gratuitamente aos acionistas, geralmente quando a empresa capitaliza reservas.' },
]

interface ExampleCard {
  heading: string
  scenario: string[]
  result: string
  sub: string
  note: string
  negative?: boolean
}

const exampleCards: ExampleCard[] = [
  {
    heading: 'Exemplo 1: Blue Chips - Petrobras (PETR4)',
    scenario: ['Investimento inicial: R$ 10.000', 'Aporte mensal: R$ 500', 'Período: 5 anos (2019-2024)', 'Dividendos reinvestidos: Sim'],
    result: 'Resultado aproximado: R$ 55.000 - R$ 65.000',
    sub: 'Total investido: R$ 40.000 | Ganho: R$ 15.000 - R$ 25.000',
    note: 'PETR4 teve forte volatilidade mas pagou dividendos generosos, especialmente em 2022-2024.',
  },
  {
    heading: 'Exemplo 2: Dividendos Consistentes - Itaú (ITUB4)',
    scenario: ['Investimento inicial: R$ 20.000', 'Aporte mensal: R$ 1.000', 'Período: 10 anos (2014-2024)', 'Dividendos reinvestidos: Sim'],
    result: 'Resultado aproximado: R$ 280.000 - R$ 320.000',
    sub: 'Total investido: R$ 140.000 | Ganho: R$ 140.000 - R$ 180.000',
    note: 'ITUB4 é conhecida por pagar dividendos consistentes, com Dividend Yield médio de 4-6% a.a.',
  },
  {
    heading: 'Exemplo 3: Growth Stock - Magazine Luiza (MGLU3)',
    scenario: ['Investimento inicial: R$ 10.000', 'Aporte mensal: R$ 500', 'Período: 5 anos (2019-2024)', 'Dividendos: Poucos ou nenhum'],
    result: 'Resultado aproximado: R$ 15.000 - R$ 25.000',
    sub: 'Total investido: R$ 40.000 | Perda: R$ 15.000 - R$ 25.000',
    note: 'MGLU3 teve crescimento explosivo até 2020, mas forte queda após pandemia. Exemplo de alta volatilidade.',
    negative: true,
  },
  {
    heading: 'Exemplo 4: Banco do Brasil (BBAS3), banco estatal com DY 8-12%',
    scenario: ['Investimento inicial: R$ 10.000', 'Aporte mensal: R$ 500', 'Período: 10 anos', 'Dividendos reinvestidos: Sim'],
    result: 'Resultado aproximado: R$ 90.000 - R$ 120.000',
    sub: 'Total investido: R$ 70.000 | Ganho: R$ 20.000 - R$ 50.000',
    note: 'BBAS3 é dos maiores pagadores de dividendos da B3, com DY de 8-12% em vários anos. Sensível a ciclo político, mas balanço sólido.',
  },
  {
    heading: 'Exemplo 5: Ambev (ABEV3), defensiva com dividendos previsíveis',
    scenario: ['Investimento inicial: R$ 10.000', 'Aporte mensal: R$ 500', 'Período: 10 anos', 'Dividendos reinvestidos: Sim'],
    result: 'Resultado aproximado: R$ 65.000 - R$ 85.000',
    sub: 'Total investido: R$ 70.000 | Ganho: até R$ 15.000',
    note: 'ABEV3 é uma defensiva clássica: DY menor (3-5%) mas previsível, baixa volatilidade. Não brilha em ciclos de bolsa em alta, mas segura bem em crises.',
  },
]

const portfolioRows = [
  ['ITUB4', 'Itaú Unibanco', 'Bancos', '20%'],
  ['VALE3', 'Vale', 'Mineração', '15%'],
  ['WEGE3', 'WEG', 'Bens Industriais', '15%'],
  ['PETR4', 'Petrobras', 'Petróleo', '15%'],
  ['BBDC4', 'Bradesco', 'Bancos', '15%'],
  ['BBAS3', 'Banco do Brasil', 'Bancos', '10%'],
  ['RENT3', 'Localiza', 'Serviços', '10%'],
]

const tipCards = [
  { title: '1. Invista no Longo Prazo', body: 'Ações são voláteis no curto prazo, mas historicamente rentáveis em 10+ anos. Não invista dinheiro que você vai precisar em menos de 5 anos.' },
  { title: '2. Diversifique Sempre', body: 'Nunca coloque todos os ovos na mesma cesta. Diversifique entre setores e tipos de ações. Use o simulador para testar diferentes combinações.' },
  { title: '3. Reinvista os Dividendos', body: 'Principalmente na fase de acumulação. O efeito composto dos dividendos pode dobrar seu patrimônio ao longo de 20-30 anos.' },
  { title: '4. Estude as Empresas', body: 'Não compre ações só porque alguém recomendou. Entenda o negócio, analise fundamentos e use o simulador para ver o histórico.' },
  { title: '5. Mantenha Aportes Regulares', body: 'Invista mensalmente, independente do momento do mercado. Isso reduz risco de timing e constrói disciplina.' },
  { title: '6. Não Se Desespere em Crises', body: 'Quedas fazem parte. Historicamente, quem manteve investido em crises saiu ganhando. Use quedas para comprar mais barato.' },
]

const relatedRankings = [
  { to: '/ranking/maiores-altas-mes', title: 'Maiores altas do mês', sub: 'Top performers nos últimos 30 dias' },
  { to: '/ranking/maiores-altas-12-meses', title: 'Maiores altas de 12 meses', sub: 'Quem mais valorizou no último ano' },
  { to: '/ranking/maiores-receitas', title: 'Maiores receitas', sub: 'Top empresas por faturamento TTM' },
]

// FAQs verbatim da página antiga (15; brand.name/brand.url resolvidos pra
// Redentia/redentia.com.br). O FAQPage JSON-LD é emitido pelo NuFaqAccordion
// — fonte única, mesmo padrão do app antigo (MoleculesFAQ).
const faqItems = [
  { q: 'Os resultados do simulador são precisos?', a: 'Sim. Usamos dados históricos reais da B3, incluindo preços de fechamento ajustados, dividendos e JCP pagos. Lembre-se que rentabilidades passadas não garantem retornos futuros. O simulador serve para análise histórica e aprendizado, não para prever o futuro.' },
  { q: 'Por que reinvestir dividendos é importante?', a: 'Reinvestir dividendos cria um efeito composto poderoso. Você usa os proventos para comprar mais ações, que geram mais dividendos, e assim por diante. Em 20-30 anos, a diferença entre reinvestir ou sacar pode representar 100-200% a mais de patrimônio. Para quem está acumulando riqueza, reinvestir é essencial.' },
  { q: 'Qual a diferença entre ações ON e PN?', a: 'Ações ON (Ordinárias, terminadas em 3) dão direito a voto em assembleias. Ações PN (Preferenciais, terminadas em 4) geralmente não dão voto, mas têm preferência no recebimento de dividendos. Para investidores individuais focados em dividendos, PN costuma ser a escolha. ITUB4 é PN, PETR4 é PN, VALE3 é exceção (ON). Para quem quer participar de decisões da empresa ou compra grande volume, ON pode fazer sentido.' },
  { q: 'Quantas ações devo ter na carteira?', a: 'Estudos mostram que 8-15 ações bem diversificadas (setores diferentes) eliminam a maior parte do risco não-sistemático. Menos de 5 ações = risco concentrado demais. Mais de 20 = difícil acompanhar e poucos ganhos adicionais de diversificação. Para iniciantes, começar com 5-8 blue chips de setores diferentes é um bom ponto de partida.' },
  { q: 'Quando é melhor fazer aporte único vs aportes mensais?', a: 'Se você tem um valor grande disponível, estatisticamente investir tudo imediatamente tende a render mais (70% das vezes o mercado sobe no longo prazo). Aportes mensais reduzem ansiedade, permitem comprar em diferentes momentos de preço (preço médio), facilitam disciplina e permitem começar mesmo sem muito capital. Uma estratégia mista é investir 50% imediatamente e o resto em aportes mensais.' },
  { q: 'O simulador considera custos e impostos?', a: 'O simulador não desconta corretagem, custódia ou imposto sobre ganho de capital (15% acima de R$ 20 mil/mês em vendas). Dividendos são isentos de IR para pessoa física, mas JCP tem 15% retido na fonte. Para resultados mais precisos, considere que seus ganhos reais serão cerca de 2-5% menores devido a esses custos, especialmente se você fizer muitas operações pequenas.' },
  { q: 'Devo investir em ações de alto dividend yield?', a: 'Não necessariamente. Dividend Yield alto pode indicar: 1) Empresa madura pagando bem os acionistas (bom), 2) Preço da ação caiu muito (cuidado), ou 3) Empresa distribuindo mais do que deveria. Avalie payout (% do lucro distribuído, ideal 40-60%), histórico de pagamentos consistentes, saúde financeira e potencial de crescimento. Empresas com DY médio mas crescimento forte podem ser melhores no longo prazo.' },
  { q: 'Ações ou FIIs, qual é melhor para dividendos?', a: 'Depende do objetivo. FIIs pagam dividendos mensais e maiores (DY de 8-12%), mas têm menor potencial de valorização. Ações pagam menos em dividendos (DY de 3-8%) mas podem valorizar mais no longo prazo. O ideal é ter ambos: FIIs para renda passiva mensal estável, ações para crescimento de capital e proteção contra inflação. Carteira balanceada pode ter 40-60% ações e 40-60% FIIs, dependendo do perfil.' },
  { q: 'Como escolher boas ações para investir?', a: 'Analise: 1) Fundamentos: lucro consistente, baixo endividamento, boa geração de caixa, 2) Dividendos: histórico de pagamentos, payout sustentável, 3) Setor: defensivos ou com boas perspectivas, 4) Preço: não pagar caro (P/L, P/VP razoáveis), 5) Gestão: empresa bem administrada, 6) Vantagem competitiva: diferenciação, marca forte. Use o simulador para ver como a ação performou no passado e leia análises na Redentia.' },
  { q: 'Qual o melhor período para simular?', a: 'Teste diferentes períodos. 5 anos mostra ciclos recentes. 10 anos inclui crises e recuperações. 15-20 anos mostra o verdadeiro poder do longo prazo, mas nem todas as ações têm histórico tão longo. Períodos que incluem crises (2008, 2015-2016, 2020) são especialmente educativos para entender volatilidade e recuperação. Pense sempre no longo prazo, ações são investimentos de 10+ anos.' },
  { q: 'Como funciona o reinvestimento automático de dividendos no simulador?', a: 'Cada vez que a ação simulada paga dividendo ou JCP, o simulador soma o valor recebido e usa para comprar mais ações no preço de mercado da data do pagamento (frações de ação são permitidas no cálculo). Isso reflete o comportamento real de quem usa DRIP (Dividend Reinvestment Plan). O efeito é exponencial: mais ações geram mais dividendos no próximo ciclo, e assim por diante.' },
  { q: 'Posso compartilhar uma simulação específica?', a: 'Sim. A URL da página guarda os parâmetros: https://redentia.com.br/calculadora/acoes?initial=10000&monthly=500&years=10&reinvest=1&tickers=ITUB4,VALE3 já abre o simulador preenchido e calcula automaticamente o histórico. Útil pra mandar para o cônjuge, planejador financeiro ou salvar a tese de carteira nos favoritos.' },
  { q: 'PETR4 ou VALE3: qual investir?', a: 'Ambas são gigantes commodities-exposure. PETR4 (Petrobras, óleo e gás) tem dividendos volúveis mas extraordinários em ciclos de alta. VALE3 (mineração de ferro) tem dividendos sazonais conforme preço de commodity. Ambas oferecem ~12-15% a.a. histórico em 10+ anos. Pra diversificar, prefira ter as DUAS em peso menor (10-15% cada) e adicionar bancos (ITUB4, BBAS3) e indústria (WEGE3) pra completar a carteira.' },
  { q: 'O que é estratégia Buy and Hold?', a: 'Buy and Hold significa "comprar e manter". A estratégia consiste em comprar ações de empresas sólidas e segurá-las por anos ou décadas, ignorando oscilações de curto prazo. Defendida por Warren Buffett. Funciona melhor com blue chips brasileiras (ITUB4, ITSA4, BBAS3, BBSE3, WEGE3, ABEV3). Vantagem: você aproveita 100% dos dividendos compostos e não cristaliza prejuízos em crises.' },
  { q: 'Como meu retorno se compara ao Ibovespa?', a: 'O Ibovespa rende historicamente ~14% a.a. nos últimos 30 anos. Use como benchmark: se sua carteira rende menos que o Ibovespa por 3+ anos consecutivos, vale revisar. Bater o índice consistentemente é difícil mesmo pra gestores profissionais (apenas ~30% conseguem em 10 anos). Se o objetivo é só acompanhar o índice, considere ETFs como BOVA11 (custo zero de gestão própria).' },
]

usePageSeo({
  title: 'Simulador de Ações da B3 com Dividendos 2026',
  description:
    'Simule investimento em PETR4, ITUB4, VALE3, BBAS3, WEGE3 e qualquer ação da B3. Buy and hold com dividendos reinvestidos. Compare com Ibovespa. Grátis.',
  path: '/calculadora/acoes',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadoras' },
    { name: 'Simulador de Ações', path: '/calculadora/acoes' },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: 'Simulador de Investimento em Ações Redentia',
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Simulador histórico de ações',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
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
    // FAQPage schema é emitido pelo <NuFaqAccordion> via useHead — fonte única.
  ],
})
</script>

<template>
  <div>
    <!-- ============ Hero (texto antigo verbatim, visual Nu) ============ -->
    <section class="sa__hero">
      <div class="sa__status">
        <NuxtLink to="/calculadoras" class="sa__back">← Todas as calculadoras</NuxtLink>
        <span aria-hidden>·</span>
        <span>Atualizado {{ lastUpdatedText }}</span>
      </div>
      <p class="sa__eyebrow">Simulador · Investimento em Ações</p>
      <h1 class="sa__h1">
        Histórico real da B3 com
        <em class="sa__italic">Dividendos.</em>
      </h1>
      <p class="sa__lead">
        Este simulador mostra quanto você teria ganhado investindo em qualquer ação da B3 usando <strong>dados históricos reais</strong>, incluindo dividendos e JCP reinvestidos. Escolhe ticker(s), valor inicial, aporte mensal e período. Exemplo: R$ 10.000 + R$ 500/mês em ITUB4 nos últimos 10 anos, com dividendos reinvestidos, viraria R$ 280.000-320.000.
      </p>
      <ul class="sa__chips">
        <li><span class="sa__chip-dot sa__chip-dot--positive" /> 100% gratuito</li>
        <li><span class="sa__chip-dot" /> Cálculo instantâneo</li>
        <li><span class="sa__chip-dot" /> Dados reais da B3</li>
        <li><span class="sa__chip-dot" /> Dividendos e JCP reinvestidos</li>
      </ul>
    </section>

    <!-- ============ Simulador interativo (design + kit) ============ -->
    <CalcAcoesSimulator />

    <!-- ============ Cenários populares (deep-links, texto verbatim) ============ -->
    <section class="sa__band sa__band--cream">
      <h2 class="sa__h2">Cenários populares de simulação</h2>
      <p class="sa__p sa__p--dek">
        Veja na hora o histórico real dos cenários mais buscados, basta clicar e a simulação carrega já preenchida com tickers, aporte e período.
      </p>
      <div class="sa__scenarios">
        <NuxtLink v-for="s in popularScenarios" :key="s.label" :to="s.to" class="sa__scenario">
          <span class="sa__scenario-label">{{ s.label }}</span>
          <span class="sa__scenario-sub">{{ s.sub }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ============ Conteúdo educacional (texto verbatim) ============ -->
    <section class="sa__band sa__band--white">
      <h2 class="sa__h2">Calculadora de Investimento em Ações Online</h2>
      <h2 class="sa__h2 sa__mt">Como Funciona o Simulador de Ações</h2>
      <p class="sa__p">
        Nosso simulador usa dados históricos reais da Bolsa de Valores brasileira (B3) para mostrar exatamente quanto você teria ganho (ou perdido) investindo em ações específicas. Diferente de calculadoras genéricas que usam taxas fixas, aqui você vê o resultado real, com todas as oscilações do mercado.
      </p>
      <p class="sa__p">
        O simulador considera preços históricos de fechamento, dividendos pagos, juros sobre capital próprio (JCP) e permite reinvestimento automático de proventos - exatamente como acontece na realidade com muitos investidores.
      </p>

      <h3 class="sa__h3">Por que Simular Investimentos em Ações?</h3>
      <div class="sa__cards sa__cards--two">
        <div v-for="c in whyCards" :key="c.title" class="sa__card">
          <h4 class="sa__h4 sa__h4--accent">{{ c.title }}</h4>
          <p class="sa__card-p">{{ c.body }}</p>
        </div>
      </div>
    </section>

    <!-- ============ Como usar (steps 01-05 do design, texto verbatim) ============ -->
    <section class="sa__band sa__band--cream">
      <h2 class="sa__h2 sa__h2--center">Como Usar o Simulador</h2>
      <div class="sa__steps"><CalcSteps :steps="howToSteps" /></div>
    </section>

    <!-- ============ O poder dos dividendos (texto verbatim) ============ -->
    <section class="sa__band sa__band--white">
      <h2 class="sa__h2">O Poder dos Dividendos</h2>
      <p class="sa__p">
        Dividendos são parcelas do lucro que as empresas distribuem aos acionistas. No Brasil, eles são isentos de imposto de renda para pessoa física, tornando-os ainda mais atrativos.
      </p>

      <h3 class="sa__h3">Tipos de Proventos</h3>
      <div class="sa__cards sa__cards--three">
        <div v-for="c in proventoCards" :key="c.title" class="sa__card">
          <h4 class="sa__h4 sa__h4--accent">{{ c.title }}</h4>
          <p class="sa__card-p">{{ c.body }}</p>
        </div>
      </div>

      <h3 class="sa__h3">Reinvestimento vs Saque</h3>
      <div class="sa__cards sa__cards--two">
        <div class="sa__card sa__card--positive">
          <h4 class="sa__h4 sa__h4--positive">Reinvestindo Dividendos</h4>
          <p class="sa__card-p">
            Você compra mais ações com os dividendos recebidos, acelerando o crescimento exponencial.
          </p>
          <div class="sa__result-box">
            <p class="sa__result-note">Exemplo: R$ 10.000 em ITUB4 por 10 anos</p>
            <p class="sa__result-main">Com reinvestimento: R$ 45.000</p>
            <p class="sa__result-note">Rentabilidade: 350%</p>
          </div>
        </div>
        <div class="sa__card">
          <h4 class="sa__h4">Sacando Dividendos</h4>
          <p class="sa__card-p">
            Você usa os dividendos para renda passiva, mas perde o efeito composto.
          </p>
          <div class="sa__result-box">
            <p class="sa__result-note">Exemplo: R$ 10.000 em ITUB4 por 10 anos</p>
            <p class="sa__result-main">Sem reinvestimento: R$ 28.000</p>
            <p class="sa__result-note">Rentabilidade: 180%</p>
          </div>
        </div>
      </div>
      <p class="sa__small">
        *Valores ilustrativos. Reinvestir dividendos pode praticamente dobrar seu patrimônio no longo prazo!
      </p>

      <p class="sa__p">
        Compare sempre com o Ibovespa: o índice reúne ~80 ações mais negociadas da B3 e serve como benchmark do mercado brasileiro. Histórico ~14% a.a. nos últimos 30 anos. Ações que rendem MENOS que o Ibovespa por longos períodos sinalizam underperformance, considere rebalancear.
      </p>
    </section>

    <!-- ============ Exemplos de simulações (texto verbatim) ============ -->
    <section class="sa__band sa__band--cream">
      <h2 class="sa__h2">Exemplos de Simulações</h2>

      <template v-for="ex in exampleCards" :key="ex.heading">
        <h3 class="sa__h3">{{ ex.heading }}</h3>
        <div class="sa__card sa__card--wide">
          <h4 class="sa__h4">Cenário</h4>
          <ul class="sa__list">
            <li v-for="line in ex.scenario" :key="line">{{ line }}</li>
          </ul>
          <div class="sa__result-box" :class="{ 'sa__result-box--negative': ex.negative }">
            <p class="sa__result-main">{{ ex.result }}</p>
            <p class="sa__result-note">{{ ex.sub }}</p>
            <p class="sa__result-note sa__result-note--spaced">{{ ex.note }}</p>
          </div>
        </div>
      </template>

      <p class="sa__small">
        *Estes são exemplos ilustrativos. Use o simulador para ver resultados precisos com dados reais!
      </p>
    </section>

    <!-- ============ Comparativo + diversificação (texto verbatim) ============ -->
    <section class="sa__band sa__band--white">
      <h2 class="sa__h2">Comparativo: PETR4 vs VALE3 (10 anos)</h2>
      <p class="sa__p">
        PETR4 e VALE3 são os dois pesos-pesados de commodities da B3 e disputam o topo do ranking de pagadoras de dividendos. Ver lado a lado ajuda a entender o trade-off entre as duas teses:
      </p>
      <div class="sa__cards sa__cards--two">
        <div class="sa__card">
          <h4 class="sa__h4 sa__h4--accent">PETR4, Petrobras</h4>
          <p class="sa__card-p">
            Setor de óleo e gás. Pagou dividendos extraordinários em 2022-2024 (Dividend Yield de 30%+ em alguns anos). Forte volatilidade, sensível a preço do petróleo, câmbio e política de preços. Histórico 10 anos: ~150% de retorno bruto + dividendos.
          </p>
        </div>
        <div class="sa__card">
          <h4 class="sa__h4 sa__h4--accent">VALE3, Vale</h4>
          <p class="sa__card-p">
            Setor de mineração de ferro. Dividendos sazonais conforme o preço da commodity, exporta majoritariamente pra China. Volátil. Histórico 10 anos: ~120% de retorno bruto + dividendos.
          </p>
        </div>
      </div>
      <p class="sa__p">
        Conclusão: ambas têm forte exposição a commodities. Ter VALE3 + PETR4 não dilui muito o risco setorial, as duas reagem juntas a ciclos globais. Pra balancear, combine com bancos (ITUB4, BBAS3) e bens industriais (WEGE3), que têm dinâmicas mais descorrelacionadas e dão mais previsibilidade ao portfólio.
      </p>

      <h2 class="sa__h2 sa__mt">Diversificação de Carteira</h2>
      <p class="sa__p">
        Uma das maiores vantagens do simulador é poder testar carteiras diversificadas. Ao invés de simular uma única ação, adicione 5-10 ativos diferentes e veja como a diversificação reduz volatilidade.
      </p>

      <h3 class="sa__h3">Exemplo de Carteira Diversificada</h3>
      <div class="sa__table-wrap">
        <table class="sa__table">
          <thead>
            <tr><th>Ticker</th><th>Empresa</th><th>Setor</th><th>Peso</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in portfolioRows" :key="r[0]">
              <td>{{ r[0] }}</td><td>{{ r[1] }}</td><td>{{ r[2] }}</td><td class="sa__td--accent">{{ r[3] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="sa__small">
        Esta carteira diversifica entre setores (bancos, mineração, petróleo, industriais) reduzindo risco específico.
      </p>
    </section>

    <!-- ============ FAQ (design 2 colunas, 15 perguntas verbatim) ============ -->
    <section class="sa__band sa__band--cream">
      <div class="sa__faq">
        <div class="sa__faq-left">
          <h2 class="sa__h2">Perguntas Frequentes</h2>
          <NuxtLink to="/busca" class="sa__pill">Perguntar à Redentia AI</NuxtLink>
        </div>
        <div class="sa__faq-right">
          <NuFaqAccordion :items="faqItems" />
        </div>
      </div>
    </section>

    <!-- ============ Buy and Hold (texto verbatim) ============ -->
    <section class="sa__band sa__band--white">
      <h2 class="sa__h2">Estratégia Buy and Hold: Comprar e Manter</h2>
      <p class="sa__p">
        Buy and Hold significa "comprar e manter": adquirir ações de empresas sólidas e segurar por décadas, ignorando oscilações de curto prazo. É a estratégia defendida por Warren Buffett e Charlie Munger, e historicamente entrega retornos próximos do índice de referência sem o stress de tentar acertar timing.
      </p>
      <div class="sa__cards sa__cards--two">
        <div class="sa__card">
          <h4 class="sa__h4 sa__h4--accent">Vantagens</h4>
          <p class="sa__card-p">
            Zero stress de timing de mercado. Aproveita a isenção de IR de R$ 20 mil/mês em vendas pequenas. Dividendos compostos crescem ano a ano. Custos de corretagem mínimos por baixo giro.
          </p>
        </div>
        <div class="sa__card">
          <h4 class="sa__h4 sa__h4--accent">Desvantagens</h4>
          <p class="sa__card-p">
            Precisa estômago pra crises (-30%, -50% acontecem em ciclos). Empresas que pareciam sólidas podem deteriorar (Eternit, OGX, Eletrobras). Não funciona pra dinheiro de curto prazo.
          </p>
        </div>
      </div>
      <p class="sa__p">
        Como aplicar na prática: monte uma carteira com 5-10 ações de qualidade (blue chips ITUB4, ITSA4, BBAS3, BBSE3, WEGE3, ABEV3 são clássicas), mantenha aporte mensal automático, NÃO venda em crises (cristaliza prejuízo), e rebalanceie 1x por ano pra manter os pesos próximos do plano.
      </p>
    </section>

    <!-- ============ Dicas (texto verbatim) ============ -->
    <section class="sa__band sa__band--cream">
      <h2 class="sa__h2">Dicas para Investir em Ações</h2>
      <div class="sa__cards sa__cards--two">
        <div v-for="c in tipCards" :key="c.title" class="sa__card">
          <h4 class="sa__h4 sa__h4--accent">{{ c.title }}</h4>
          <p class="sa__card-p">{{ c.body }}</p>
        </div>
      </div>
    </section>

    <!-- ============ Rankings + outras ferramentas + CTA ============ -->
    <section class="sa__band sa__band--white">
      <h2 class="sa__h2">Rankings Relacionados</h2>
      <p class="sa__p sa__p--dek">
        Explore listas atualizadas diariamente com os melhores ativos da B3 para complementar sua análise.
      </p>
      <div class="sa__cards sa__cards--three sa__cards--links">
        <NuxtLink v-for="r in relatedRankings" :key="r.to" :to="r.to" class="sa__card sa__card--link">
          <h3 class="sa__h3 sa__h3--card">{{ r.title }}</h3>
          <p class="sa__card-p">{{ r.sub }}</p>
        </NuxtLink>
      </div>

      <h2 class="sa__h2 sa__mt">Outras Ferramentas</h2>
      <div class="sa__cards sa__cards--two sa__cards--links">
        <NuxtLink to="/calculadora/juros-compostos" class="sa__card sa__card--link">
          <h3 class="sa__h3 sa__h3--card">Calculadora de Juros Compostos</h3>
          <p class="sa__card-p">Simule investimentos com taxas fixas</p>
        </NuxtLink>
        <NuxtLink to="/calculadora/planejamento" class="sa__card sa__card--link">
          <h3 class="sa__h3 sa__h3--card">Planejamento Patrimonial</h3>
          <p class="sa__card-p">Crie estratégia para suas metas</p>
        </NuxtLink>
      </div>

      <div class="sa__cta">
        <h2 class="sa__cta-title">Descubra as melhores ações para investir</h2>
        <p class="sa__cta-sub">Use a Redentia para analisar ações em tempo real, receber recomendações com IA e acompanhar sua carteira.</p>
        <div class="sa__cta-actions">
          <NuxtLink to="/login" class="sa__pill sa__pill--light">Criar conta grátis</NuxtLink>
          <NuxtLink to="/mercado" class="sa__pill sa__pill--outline">Ver ações em alta</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ——— hero ——— */
.sa__hero {
  background: var(--nu-cream);
  padding: clamp(48px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px) clamp(40px, 5vw, 64px);
  animation: nu-fade .5s ease both;
}
.sa__status {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  color: var(--nu-gray); font-size: 13.5px; font-weight: 600; margin-bottom: 22px;
}
.sa__back { color: var(--nu-blue); font-weight: 800; }
.sa__back:hover { color: var(--nu-blue-hover); }
.sa__eyebrow { margin: 0; color: var(--nu-blue); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800; }
.sa__h1 {
  margin: 12px 0 0; color: var(--nu-ink);
  font-size: clamp(34px, 4.6vw, 64px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.04; max-width: 1080px;
}
.sa__italic { font-style: italic; }
.sa__lead {
  color: var(--nu-gray-2); font-size: clamp(16px, 1.7vw, 19px); font-weight: 500;
  line-height: 1.6; margin: 20px 0 0; max-width: 780px;
}
.sa__lead strong { color: var(--nu-ink); font-weight: 800; }
.sa__chips { list-style: none; display: flex; gap: 10px; flex-wrap: wrap; margin: 26px 0 0; padding: 0; }
.sa__chips li {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 9px 15px; color: var(--nu-ink); font-size: 13.5px; font-weight: 700;
}
.sa__chip-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--nu-blue); flex-shrink: 0; }
.sa__chip-dot--positive { background: var(--nu-green); }

/* ——— bandas ——— */
.sa__band { padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.sa__band--white { background: var(--nu-white); }
.sa__band--cream { background: var(--nu-cream); }
.sa__mt { margin-top: clamp(44px, 6vw, 72px); }

/* ——— tipografia do conteúdo ——— */
.sa__h2 {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(28px, 3.4vw, 44px); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1.08; max-width: 900px;
}
.sa__h2--center { text-align: center; max-width: none; font-size: clamp(32px, 4vw, 54px); letter-spacing: -0.04em; line-height: 1.06; }
.sa__h3 { margin: clamp(28px, 4vw, 44px) 0 0; color: var(--nu-ink); font-size: clamp(20px, 2.2vw, 26px); font-weight: 800; letter-spacing: -.3px; }
.sa__h3--card { margin: 0; font-size: 18px; }
.sa__h4 { margin: 0 0 8px; color: var(--nu-ink); font-size: 16.5px; font-weight: 800; letter-spacing: -.2px; }
.sa__h4--accent { color: var(--nu-blue); }
.sa__h4--positive { color: var(--nu-green); }
.sa__p {
  margin: 14px 0 0; color: var(--nu-gray-3); font-size: 16.5px; font-weight: 500;
  line-height: 1.65; max-width: 840px;
}
.sa__p--dek { color: var(--nu-gray-2); }
.sa__small { margin: 12px 0 0; color: var(--nu-gray); font-size: 14px; font-weight: 500; line-height: 1.6; max-width: 840px; }

/* ——— cenários populares ——— */
.sa__scenarios {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px; margin-top: clamp(24px, 3.5vw, 36px);
}
.sa__scenario {
  background: var(--nu-white); border-radius: var(--nu-r-tile); padding: 16px 18px;
  display: flex; flex-direction: column; gap: 3px;
  transition: transform .18s, box-shadow .2s;
}
.sa__scenario:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.sa__scenario-label { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; letter-spacing: -.1px; }
.sa__scenario-sub { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }

/* ——— cards educacionais ——— */
.sa__cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px; margin-top: clamp(20px, 3vw, 28px);
}
.sa__cards--two { grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr)); }
.sa__cards--three { grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); }
.sa__card { background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 24px; }
.sa__band--cream .sa__card { background: var(--nu-white); }
.sa__card--positive { background: color-mix(in srgb, var(--nu-green-bg) 45%, var(--nu-white)); }
.sa__card--wide { max-width: 720px; margin-top: clamp(20px, 3vw, 28px); }
.sa__card--link { display: flex; flex-direction: column; gap: 6px; transition: transform .18s, box-shadow .2s; }
.sa__card--link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.sa__card-p { margin: 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }
.sa__card .sa__card-p { margin-top: 6px; }
.sa__list { margin: 8px 0 0; padding-left: 18px; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.7; }
.sa__result-box { background: var(--nu-blue-tint); border-radius: var(--nu-r-input); padding: 14px 16px; margin-top: 14px; }
.sa__result-box--negative { background: var(--nu-red-tint); }
.sa__result-main { margin: 0; color: var(--nu-ink); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; }
.sa__result-note { margin: 4px 0 0; color: var(--nu-gray-2); font-size: 12.5px; font-weight: 600; }
.sa__result-note:first-child { margin-top: 0; }
.sa__result-note--spaced { margin-top: 8px; }

/* ——— tabela ——— */
.sa__table-wrap {
  overflow-x: auto; background: var(--nu-cream);
  border-radius: var(--nu-r-panel); margin-top: clamp(20px, 3vw, 28px);
  max-width: 980px;
}
.sa__band--cream .sa__table-wrap { background: var(--nu-white); }
.sa__table { width: 100%; border-collapse: collapse; min-width: 560px; }
.sa__table th {
  text-align: left; padding: 14px 18px;
  color: var(--nu-gray); font-size: 12px; font-weight: 800;
  letter-spacing: .8px; text-transform: uppercase;
  border-bottom: 1.5px solid var(--nu-cream-line-2); white-space: nowrap;
}
.sa__table td {
  padding: 13px 18px; color: var(--nu-gray-3); font-size: 14.5px; font-weight: 600;
  border-bottom: 1.5px solid var(--nu-cream-line-2); font-variant-numeric: tabular-nums;
}
.sa__table tbody tr:last-child td { border-bottom: none; }
.sa__td--accent { color: var(--nu-blue); font-weight: 800; }

/* ——— steps ——— */
.sa__steps { margin-top: clamp(30px, 4vw, 48px); }

/* ——— FAQ 2 colunas (design) ——— */
.sa__faq { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.sa__faq-left { flex: 1 1 300px; min-width: min(280px, 100%); }
.sa__faq-right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
.sa__faq-left .sa__h2 { font-size: clamp(32px, 4vw, 52px); letter-spacing: -0.04em; line-height: 1.06; }
.sa__faq-right :deep(.nfa__item) { background: var(--nu-white); }

/* ——— pills / CTA ——— */
.sa__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.sa__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.sa__cta {
  background: var(--nu-blue); border-radius: var(--nu-r-card-lg);
  padding: clamp(34px, 5vw, 60px); text-align: center; margin-top: clamp(44px, 6vw, 72px);
}
.sa__cta-title { margin: 0; color: var(--nu-white); font-size: clamp(26px, 3.4vw, 44px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; max-width: none; }
.sa__cta-sub { margin: 14px auto 0; color: var(--nu-white-75); font-size: 16px; font-weight: 500; line-height: 1.6; max-width: 560px; }
.sa__cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 26px; }
.sa__cta .sa__pill { margin-top: 0; }
.sa__pill--light { background: var(--nu-cream); color: var(--nu-blue); }
.sa__pill--light:hover { background: var(--nu-white); color: var(--nu-blue-hover); }
.sa__pill--outline { background: transparent; border: 2px solid var(--nu-white-35); color: var(--nu-white); }
.sa__pill--outline:hover { background: var(--nu-white-14); color: var(--nu-white); }
</style>

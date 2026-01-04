import type { TermoGlossario } from '~/types/glossario'

export const termos: TermoGlossario[] = [
  // ========================================
  // INDICADORES FINANCEIROS
  // ========================================
  {
    slug: 'dividend-yield',
    nome: 'Dividend Yield',
    sigla: 'DY',
    categoria: 'indicador',
    definicaoResumida:
      'Dividend Yield (DY) é o percentual de retorno que uma ação ou FII paga em dividendos em relação ao seu preço atual. Indica a rentabilidade dos proventos.',
    definicaoCompleta: `O Dividend Yield, abreviado como DY, é um dos indicadores mais importantes para investidores que buscam renda passiva. Ele mostra quanto você recebe de dividendos em relação ao preço que pagou pela ação ou cota de FII.

Este indicador é expresso em percentual e calculado considerando os últimos 12 meses de distribuição de proventos. É fundamental para quem busca construir uma carteira de dividendos e viver de renda passiva.

**Por que o Dividend Yield é importante?**

• Indica o retorno anual em dividendos que você receberá
• Permite comparar diferentes ativos pagadores de dividendos
• É fundamental para estratégias de renda passiva
• Ajuda a identificar empresas com boa distribuição de lucros aos acionistas

**Interpretação dos valores:**

Para Ações brasileiras, um DY entre 4% e 8% ao ano é considerado bom. Para Fundos Imobiliários (FIIs), o mercado costuma buscar DY entre 8% e 12% ao ano, devido à obrigatoriedade de distribuição de 95% dos lucros.`,
    formula: 'DY = (Dividendos pagos nos últimos 12 meses ÷ Preço atual) × 100',
    exemplo:
      'Se você comprou uma ação de PETR4 a R$ 40,00 e recebeu R$ 3,20 em dividendos nos últimos 12 meses, o Dividend Yield é de 8% (3,20 ÷ 40 = 0,08 ou 8%). Isso significa que seus dividendos representam 8% de retorno anual sobre o valor investido.',
    atencao:
      'Um DY muito alto (acima de 15% em ações) pode ser um sinal de alerta. Geralmente indica que o preço da ação caiu muito, possivelmente por problemas na empresa. Sempre compare o DY com o histórico do ativo e a média do setor.',
    comoUsar:
      'Use o DY para comparar empresas do mesmo setor, montar carteiras de dividendos e estimar sua renda passiva futura. Na Redentia, você encontra o DY atualizado de todas as ações e FIIs.',
    relacionados: [
      'dividendos',
      'proventos',
      'jscp',
      'payout',
      'p-l',
      'roe',
    ],
    palavrasChave: [
      'dividend yield',
      'dy',
      'dividendos',
      'yield',
      'renda passiva',
      'proventos',
    ],
  },
  {
    slug: 'p-l',
    nome: 'P/L',
    sigla: 'P/L',
    categoria: 'indicador',
    definicaoResumida:
      'P/L (Preço sobre Lucro) indica quantos anos seriam necessários para recuperar o investimento através dos lucros da empresa. É um dos principais indicadores de valuation.',
    definicaoCompleta: `O P/L (Preço sobre Lucro) é um dos indicadores fundamentalistas mais utilizados no mercado de ações. Ele mostra a relação entre o preço atual da ação e o lucro por ação (LPA) que a empresa gera.

Em termos simples, o P/L indica quantos anos, ao ritmo atual de lucro, seriam necessários para que a empresa "pague" o valor que você investiu. É como um "payback period" para ações.

**Como interpretar o P/L:**

• P/L baixo (5-10): pode indicar que a ação está barata ou que o mercado tem expectativas negativas sobre a empresa
• P/L médio (10-20): considerado normal para a maioria dos setores
• P/L alto (acima de 20): pode indicar que a ação está cara ou que o mercado espera alto crescimento futuro

**Importante:** Sempre compare o P/L com outras empresas do mesmo setor, pois cada segmento tem suas particularidades. Empresas de tecnologia, por exemplo, costumam ter P/L mais alto que bancos.`,
    formula: 'P/L = Preço da Ação ÷ Lucro por Ação (LPA)',
    exemplo:
      'Se a ação de ITUB4 está cotada a R$ 30,00 e o Lucro por Ação (LPA) nos últimos 12 meses foi R$ 3,00, o P/L é 10 (30 ÷ 3 = 10). Isso significa que levaria 10 anos de lucro para "recuperar" o investimento.',
    atencao:
      'P/L negativo indica que a empresa teve prejuízo. Cuidado ao comparar P/L entre setores diferentes - cada segmento tem suas médias históricas. Use junto com outros indicadores como P/VP, ROE e dívidas.',
    comoUsar:
      'Use o P/L para fazer screening de ações baratas, comparar empresas do mesmo setor e avaliar se uma ação está em um bom ponto de entrada. Combine sempre com análise da qualidade da empresa.',
    relacionados: [
      'lpa',
      'p-vp',
      'p-ebit',
      'p-ebitda',
      'roe',
      'valuation',
      'lucro-liquido',
    ],
    palavrasChave: [
      'p/l',
      'pl',
      'preço lucro',
      'price earnings',
      'pe ratio',
      'valuation',
    ],
  },
  {
    slug: 'roe',
    nome: 'ROE',
    sigla: 'ROE',
    categoria: 'indicador',
    definicaoResumida:
      'ROE (Return on Equity) mede a capacidade da empresa de gerar lucro a partir do patrimônio líquido. Indica quanto de retorno a empresa gera para cada R$ 1 investido pelos acionistas.',
    definicaoCompleta: `O ROE (Return on Equity, ou Retorno sobre o Patrimônio Líquido) é um indicador que mostra a eficiência da empresa em gerar lucro a partir do capital dos acionistas.

Este é um dos indicadores mais importantes para avaliar a qualidade de uma empresa. Um ROE consistentemente alto indica que a empresa tem vantagens competitivas e é eficiente na geração de valor.

**Como interpretar o ROE:**

• ROE abaixo de 10%: considerado baixo, empresa pouco eficiente
• ROE entre 10-15%: razoável, empresa mediana
• ROE entre 15-20%: bom, empresa eficiente
• ROE acima de 20%: excelente, empresa muito eficiente

Warren Buffett, um dos maiores investidores do mundo, busca empresas com ROE consistentemente acima de 15% ao longo dos anos.

**Por que o ROE é importante?**

• Mostra a eficiência da gestão em gerar lucros
• Permite comparar empresas de diferentes tamanhos
• Identifica empresas com vantagens competitivas duradouras
• É um dos principais critérios de investidores de longo prazo`,
    formula: 'ROE = (Lucro Líquido ÷ Patrimônio Líquido) × 100',
    exemplo:
      'Se uma empresa teve lucro líquido de R$ 100 milhões e o patrimônio líquido é de R$ 500 milhões, o ROE é de 20% (100 ÷ 500 = 0,20 ou 20%). Isso significa que para cada R$ 1 de patrimônio, a empresa gera R$ 0,20 de lucro.',
    atencao:
      'Um ROE muito alto (acima de 40%) pode indicar alto endividamento (efeito alavancagem). Prefira empresas com ROE alto e dívida controlada. Analise a consistência do ROE ao longo de vários anos, não apenas um período.',
    comoUsar:
      'Use o ROE para identificar empresas de qualidade, comparar concorrentes do mesmo setor e construir carteiras de longo prazo. Na Redentia, você encontra o ROE histórico de todas as ações.',
    relacionados: [
      'roa',
      'roic',
      'patrimonio-liquido',
      'lucro-liquido',
      'p-l',
      'margem-liquida',
    ],
    palavrasChave: [
      'roe',
      'return on equity',
      'retorno patrimonio',
      'rentabilidade',
      'eficiencia',
    ],
  },
  {
    slug: 'ev-ebit',
    nome: 'EV/EBIT',
    sigla: 'EV/EBIT',
    categoria: 'indicador',
    definicaoResumida:
      'EV/EBIT compara o Valor da Firma (Enterprise Value) com o Lucro Operacional (EBIT). Indica quantos anos a empresa levaria para pagar seu valor total através do lucro operacional.',
    definicaoCompleta: `O EV/EBIT é um múltiplo de valuation que relaciona o Enterprise Value (valor total da empresa incluindo dívidas) com o EBIT (lucro operacional antes de juros e impostos).

Este indicador é considerado mais completo que o P/L porque considera a dívida da empresa e usa o lucro operacional, que não é afetado pela estrutura de capital.

**Vantagens do EV/EBIT:**

• Permite comparar empresas com diferentes níveis de endividamento
• Usa lucro operacional (menos volátil que lucro líquido)
• Útil para avaliar empresas que estão em processo de aquisição
• Melhor para comparações entre setores

**Como interpretar:**

• EV/EBIT baixo (< 8): empresa potencialmente barata
• EV/EBIT médio (8-15): avaliação normal
• EV/EBIT alto (> 15): empresa potencialmente cara

Compare sempre com a média histórica da empresa e do setor.`,
    formula: 'EV/EBIT = Enterprise Value ÷ EBIT',
    exemplo:
      'Se uma empresa tem Enterprise Value de R$ 1 bilhão e EBIT de R$ 100 milhões, o EV/EBIT é 10x. Isso significa que levaria 10 anos de lucro operacional para "pagar" o valor total da empresa.',
    atencao:
      'Empresas em crescimento acelerado podem ter EV/EBIT alto justificadamente. Empresas cíclicas podem ter múltiplos distorcidos em períodos de alta ou baixa do ciclo.',
    comoUsar:
      'Use para comparar empresas do mesmo setor, avaliar se uma empresa está cara ou barata, e em análises de fusões e aquisições.',
    relacionados: [
      'ebit',
      'enterprise-value',
      'ev-ebitda',
      'p-l',
      'p-ebit',
      'valuation',
    ],
    palavrasChave: [
      'ev/ebit',
      'ev ebit',
      'enterprise value',
      'múltiplo',
      'valuation',
    ],
  },
  {
    slug: 'ebitda',
    nome: 'EBITDA',
    sigla: 'EBITDA',
    categoria: 'indicador',
    definicaoResumida:
      'EBITDA (Earnings Before Interest, Taxes, Depreciation and Amortization) é o lucro antes de juros, impostos, depreciação e amortização. Mede a geração de caixa operacional da empresa.',
    definicaoCompleta: `O EBITDA é um indicador financeiro que mostra o potencial de geração de caixa de uma empresa a partir de suas operações, desconsiderando efeitos financeiros, tributários e contábeis.

EBITDA significa "Earnings Before Interest, Taxes, Depreciation and Amortization", ou em português: "Lucro Antes de Juros, Impostos, Depreciação e Amortização".

**Por que o EBITDA é importante?**

• Permite comparar empresas com diferentes estruturas de capital
• Ignora efeitos contábeis (depreciação) e foca na geração de caixa
• É muito usado em análises de valuation e M&A (fusões e aquisições)
• Mostra a eficiência operacional pura do negócio

**Vantagens:**

• Comparabilidade entre empresas de diferentes países (diferentes regimes tributários)
• Foco na operação, sem influência de decisões de financiamento
• Útil para empresas intensivas em capital (muita depreciação)

**Limitações:**

• Não considera investimentos necessários (Capex)
• Não mostra a necessidade de capital de giro
• Pode mascarar problemas com dívida alta`,
    formula:
      'EBITDA = Lucro Operacional (EBIT) + Depreciação + Amortização',
    exemplo:
      'Se uma empresa tem EBIT de R$ 50 milhões, depreciação de R$ 10 milhões e amortização de R$ 5 milhões, o EBITDA é R$ 65 milhões (50 + 10 + 5).',
    atencao:
      'EBITDA não é igual a fluxo de caixa. Ele não considera variações de capital de giro nem investimentos (Capex). Use sempre junto com análise de fluxo de caixa livre.',
    comoUsar:
      'Use para avaliar a eficiência operacional, comparar empresas do mesmo setor e calcular múltiplos como EV/EBITDA e Dívida Líquida/EBITDA.',
    relacionados: [
      'ebit',
      'ev-ebitda',
      'margem-ebitda',
      'divida-liquida-ebitda',
      'lucro-liquido',
    ],
    palavrasChave: [
      'ebitda',
      'lucro operacional',
      'geração caixa',
      'earnings',
    ],
  },
  {
    slug: 'p-vp',
    nome: 'P/VP',
    sigla: 'P/VP',
    categoria: 'indicador',
    definicaoResumida:
      'P/VP (Preço sobre Valor Patrimonial) compara o preço da ação com seu valor patrimonial. Indica se a ação está sendo negociada acima ou abaixo do patrimônio líquido por ação.',
    definicaoCompleta: `O P/VP (Preço sobre Valor Patrimonial) é um indicador que relaciona o preço de mercado da ação com o valor patrimonial (VPA) da empresa.

O Valor Patrimonial por Ação (VPA) representa quanto cada ação "vale" em termos de patrimônio líquido da empresa. Já o preço de mercado é quanto os investidores estão dispostos a pagar.

**Como interpretar o P/VP:**

• P/VP < 1: ação negociada com desconto em relação ao patrimônio (pode ser oportunidade ou empresa com problemas)
• P/VP = 1: preço igual ao valor patrimonial
• P/VP > 1: mercado paga prêmio, geralmente porque espera crescimento ou a empresa tem ativos intangíveis valiosos (marca, etc.)

**Quando usar P/VP:**

É particularmente útil para avaliar bancos, seguradoras e empresas holdings, onde o patrimônio líquido é mais representativo do valor real.

Para empresas de tecnologia ou serviços, o P/VP pode ser menos relevante, pois o valor está mais nos ativos intangíveis (marca, conhecimento) que não aparecem totalmente no balanço.`,
    formula: 'P/VP = Preço da Ação ÷ Valor Patrimonial por Ação (VPA)',
    exemplo:
      'Se BBAS3 está cotada a R$ 45,00 e o VPA é R$ 30,00, o P/VP é 1,5 (45 ÷ 30). Isso significa que o mercado está pagando 50% acima do valor patrimonial da ação.',
    atencao:
      'P/VP muito baixo (< 0,5) pode indicar que o mercado duvida da qualidade dos ativos ou espera prejuízos futuros. Não use P/VP isoladamente - combine com ROE, lucros e análise qualitativa.',
    comoUsar:
      'Especialmente útil para bancos, seguradoras e holdings. Use para identificar ações baratas em relação ao patrimônio, mas sempre verifique a qualidade dos ativos e a rentabilidade (ROE).',
    relacionados: [
      'vpa',
      'p-l',
      'roe',
      'patrimonio-liquido',
      'valuation',
      'liquidez',
    ],
    palavrasChave: [
      'p/vp',
      'pvp',
      'preço valor patrimonial',
      'book value',
      'valor patrimonial',
    ],
  },

  // ========================================
  // FUNDOS IMOBILIÁRIOS
  // ========================================
  {
    slug: 'fii',
    nome: 'Fundos Imobiliários',
    sigla: 'FII',
    categoria: 'fii',
    definicaoResumida:
      'Fundos Imobiliários (FIIs) são fundos de investimento que aplicam em empreendimentos imobiliários. Permitem investir em imóveis de forma acessível e com alta liquidez.',
    definicaoCompleta: `Os Fundos de Investimento Imobiliário (FIIs) são uma forma de investir em imóveis sem precisar comprar um imóvel físico. Funcionam como um "condomínio de investidores" que, juntos, compram e administram ativos imobiliários.

**Tipos de FIIs:**

• **Fundos de Tijolo:** investem em imóveis físicos (shoppings, escritórios, galpões logísticos, hospitais)
• **Fundos de Papel:** investem em títulos do setor imobiliário (CRIs, LCIs, debêntures)
• **Fundos de Fundos:** investem em cotas de outros FIIs
• **Fundos Híbridos:** combinam tijolo e papel

**Vantagens dos FIIs:**

• Rendimentos mensais (obrigatoriedade de distribuir 95% dos lucros)
• Isenção de Imposto de Renda sobre os rendimentos (para pessoas físicas)
• Liquidez: pode vender cotas na bolsa a qualquer momento
• Acessibilidade: investe em grandes imóveis com pouco capital
• Diversificação: um fundo pode ter vários imóveis

**Como funcionam:**

Você compra cotas na B3, torna-se cotista do fundo e recebe dividendos mensalmente proporcionais à quantidade de cotas. A gestão dos imóveis é feita por profissionais especializados.`,
    exemplo:
      'Ao comprar 100 cotas de um FII de shopping por R$ 100 cada (investimento de R$ 10.000), você passa a receber dividendos mensais. Se o dividend yield for de 0,8% ao mês, você receberia R$ 80 por mês (0,8% de R$ 10.000).',
    atencao:
      'FIIs têm risco de vacância (imóveis vazios), inadimplência de inquilinos e desvalorização. O valor da cota pode oscilar. Analise a qualidade dos imóveis, taxa de vacância, diversificação e histórico de pagamentos.',
    comoUsar:
      'Use FIIs para gerar renda passiva mensal. Diversifique entre diferentes tipos (tijolo, papel, setores). Na Redentia, você encontra análises completas, dividend yield e indicadores de todos os FIIs.',
    relacionados: [
      'dividend-yield',
      'vacancia',
      'cap-rate',
      'noi',
      'ifix',
      'proventos',
    ],
    palavrasChave: [
      'fii',
      'fundos imobiliários',
      'fiis',
      'renda passiva',
      'dividendos mensais',
    ],
  },
  {
    slug: 'vacancia',
    nome: 'Vacância',
    sigla: null,
    categoria: 'fii',
    definicaoResumida:
      'Vacância é o percentual de área não locada em um imóvel ou portfólio de imóveis. Indica quantos metros quadrados estão vazios (sem gerar receita) em relação ao total.',
    definicaoCompleta: `A vacância é um dos indicadores mais importantes para avaliar Fundos Imobiliários de tijolo. Ela mostra a porcentagem de área construída que está vazia, ou seja, não está alugada e portanto não está gerando receita.

**Como calcular:**

Vacância = (Área não locada ÷ Área total locável) × 100

**Tipos de vacância:**

• **Vacância Física:** área realmente vazia, sem inquilino
• **Vacância Financeira:** considera também inadimplência e carências (períodos sem pagamento)

**Como interpretar:**

• Vacância 0-5%: excelente, praticamente cheio
• Vacância 5-10%: boa, normal em alguns setores
• Vacância 10-20%: atenção, pode afetar dividendos
• Vacância > 20%: crítico, risco alto

**Impacto nos dividendos:**

Quanto maior a vacância, menor a receita de aluguéis e, consequentemente, menores os dividendos distribuídos. Um FII com alta vacância tende a ter dividend yield menor.

**Fatores que afetam a vacância:**

• Localização do imóvel
• Qualidade do imóvel e das instalações
• Preço do aluguel (competitividade)
• Momento econômico do setor
• Gestão do fundo`,
    exemplo:
      'Um FII de lajes corporativas tem 10.000 m² de área locável. Atualmente 1.500 m² estão vazios. A vacância é de 15% (1.500 ÷ 10.000 = 0,15 ou 15%).',
    atencao:
      'Vacância temporária para reforma pode ser positiva. Compare a vacância do FII com a média do setor e da região. Verifique o histórico: vacância crescente é preocupante.',
    comoUsar:
      'Use para avaliar a saúde de FIIs de tijolo. Compare FIIs do mesmo segmento. Acompanhe a evolução trimestral da vacância nos relatórios gerenciais.',
    relacionados: [
      'fii',
      'cap-rate',
      'noi',
      'dividend-yield',
      'ifix',
    ],
    palavrasChave: [
      'vacância',
      'vacancia',
      'ocupação',
      'área vazia',
      'fii',
    ],
  },

  // ========================================
  // MERCADO E ESTRATÉGIAS
  // ========================================
  {
    slug: 'diversificacao',
    nome: 'Diversificação',
    sigla: null,
    categoria: 'estrategia',
    definicaoResumida:
      'Diversificação é a estratégia de distribuir investimentos entre diferentes ativos, setores e classes para reduzir riscos. É o princípio de "não colocar todos os ovos na mesma cesta".',
    definicaoCompleta: `A diversificação é uma das estratégias mais importantes para reduzir riscos em investimentos. O conceito é simples: ao distribuir seu capital entre diferentes ativos, você reduz o impacto negativo que um único ativo ruim pode ter na sua carteira.

**Por que diversificar?**

• Reduz o risco específico de cada empresa ou setor
• Protege contra eventos imprevistos
• Permite capturar oportunidades em diferentes mercados
• Melhora a relação risco-retorno da carteira

**Níveis de diversificação:**

1. **Entre ativos:** ações, FIIs, renda fixa, criptomoedas
2. **Entre setores:** não concentre tudo em bancos ou petróleo
3. **Entre empresas:** várias empresas do mesmo setor
4. **Geográfica:** Brasil, EUA, Europa, etc.
5. **Temporal:** aportes periódicos (dollar cost averaging)

**Diversificação ideal:**

Estudos mostram que 20-30 ativos diferentes já capturam a maior parte dos benefícios da diversificação. Mais que isso pode dificultar o acompanhamento sem ganho significativo de redução de risco.

**Atenção ao excesso:**

Diversificar demais (mais de 50 ativos) pode diluir ganhos e dificultar o gerenciamento. É o que chamamos de "diworsification" (piora pela diversificação excessiva).`,
    exemplo:
      'Ao invés de investir R$ 10.000 apenas em PETR4, você distribui: R$ 2.000 em PETR4, R$ 2.000 em VALE3, R$ 2.000 em ITUB4, R$ 2.000 em FIIs e R$ 2.000 em Tesouro Direto. Assim, se Petrobras cair 20%, sua carteira cairá apenas ~4%.',
    comoUsar:
      'Comece definindo a alocação entre classes de ativos (ex: 60% ações, 30% FIIs, 10% renda fixa). Dentro de cada classe, diversifique entre setores e empresas. Rebalanceie periodicamente.',
    relacionados: [
      'alocacao-carteira',
      'risco',
      'volatilidade',
      'rebalanceamento',
    ],
    palavrasChave: [
      'diversificação',
      'diversificacao',
      'gestão de risco',
      'carteira',
      'alocação',
    ],
  },
  {
    slug: 'buy-and-hold',
    nome: 'Buy and Hold',
    sigla: null,
    categoria: 'estrategia',
    definicaoResumida:
      'Buy and Hold é a estratégia de comprar ativos de qualidade e mantê-los por longos períodos, independente de oscilações de curto prazo. Foco em empresas sólidas e juros compostos.',
    definicaoCompleta: `Buy and Hold ("Comprar e Segurar") é uma estratégia de investimento de longo prazo onde o investidor compra ações de empresas de qualidade e as mantém por anos ou décadas, independente das oscilações de mercado.

**Princípios do Buy and Hold:**

• Foco em empresas de qualidade (bons fundamentos)
• Visão de longo prazo (5+ anos, idealmente 10+)
• Não se preocupar com volatilidade de curto prazo
• Reinvestir dividendos
• Aproveitar juros compostos ao longo do tempo

**Vantagens:**

• Menos custos com corretagem (poucas operações)
• Benefícios fiscais (sem imposto até venda)
• Menos stress e tempo dedicado
• Aproveita o crescimento de longo prazo das empresas
• Comprovado historicamente (Warren Buffett)

**Requisitos:**

• Selecionar empresas de qualidade (bons indicadores)
• Ter reserva de emergência
• Disciplina emocional para não vender na queda
• Paciência para esperar os resultados

**Quando vender:**

Apenas se os fundamentos da empresa se deteriorarem significativamente ou se você precisar do dinheiro para algo importante. Oscilações de mercado não são motivo para vender.`,
    exemplo:
      'Um investidor compra R$ 10.000 em ações do Itaú em 2010 e mantém até 2025. Apesar de várias crises nesse período, a empresa continuou lucrativa, pagando dividendos. Com reinvestimento dos dividendos e valorização, o investimento pode ter se multiplicado várias vezes.',
    atencao:
      'Buy and Hold não significa "comprar e esquecer". Você deve acompanhar os resultados trimestrais e indicadores. Se a empresa entrar em crise estrutural (não temporária), pode ser necessário vender.',
    comoUsar:
      'Escolha empresas líderes de setor, com histórico de lucros consistentes, baixo endividamento e bom ROE. Foque em qualidade sobre preço baixo. Tenha horizonte mínimo de 5 anos.',
    relacionados: [
      'diversificacao',
      'dividendos',
      'roe',
      'p-l',
      'blue-chips',
      'valuation',
    ],
    palavrasChave: [
      'buy and hold',
      'comprar e segurar',
      'longo prazo',
      'warren buffett',
      'estratégia',
    ],
  },
  {
    slug: 'ifix',
    nome: 'IFIX',
    sigla: 'IFIX',
    categoria: 'mercado',
    definicaoResumida:
      'IFIX é o índice que mede o desempenho médio dos Fundos Imobiliários mais negociados na B3. É como o Ibovespa, mas para FIIs.',
    definicaoCompleta: `O IFIX (Índice de Fundos de Investimentos Imobiliários) é o principal indicador de desempenho do mercado de fundos imobiliários no Brasil. Foi criado pela B3 em 2012.

**Como funciona:**

O IFIX é composto por uma carteira teórica de FIIs que representam mais de 95% do mercado em termos de liquidez e valor de mercado. A participação de cada FII no índice é ponderada pelo seu valor de mercado.

**Critérios para um FII entrar no IFIX:**

• Estar entre os FIIs mais negociados
• Ter presença em pelo menos 60% dos pregões
• Não ser fundo de fundos
• Cumprir requisitos de liquidez

**Para que serve:**

• Medir a performance geral do mercado de FIIs
• Servir de benchmark para gestores e investidores
• Base para ETFs de FIIs
• Indicador da saúde do mercado imobiliário

**Interpretação:**

Se o IFIX subiu 10% no ano, significa que, em média, os principais FIIs da bolsa tiveram valorização de 10%. Mas lembre-se: IFIX mede apenas variação de preço, não inclui dividendos.

**IFIX Total Return:**

Existe também o IFIX TR (Total Return) que considera o reinvestimento dos dividendos, dando visão mais completa do retorno.`,
    exemplo:
      'Se você acompanha o IFIX e vê que ele está em 3.200 pontos, isso não tem significado absoluto. O importante é comparar com períodos anteriores: se estava em 3.000 há um mês, houve valorização de 6,67%.',
    comoUsar:
      'Use o IFIX como referência para avaliar se sua carteira de FIIs está indo bem. Se o IFIX subiu 15% no ano e sua carteira subiu apenas 5%, pode ser hora de revisar seus FIIs.',
    relacionados: [
      'fii',
      'ibovespa',
      'dividend-yield',
      'benchmark',
    ],
    palavrasChave: [
      'ifix',
      'índice',
      'fundos imobiliários',
      'benchmark',
      'b3',
    ],
  },
  {
    slug: 'ibovespa',
    nome: 'Ibovespa',
    sigla: 'IBOV',
    categoria: 'mercado',
    definicaoResumida:
      'Ibovespa é o principal índice da bolsa brasileira (B3). Mede o desempenho médio das ações mais negociadas, servindo como termômetro do mercado.',
    definicaoCompleta: `O Ibovespa (Índice Bovespa) é o mais importante indicador de desempenho das ações negociadas na B3 (Bolsa de Valores do Brasil). Foi criado em 1968 e é usado como principal referência para o mercado acionário brasileiro.

**Como funciona:**

O Ibovespa é composto por uma carteira teórica de ações que representa cerca de 80% do volume negociado na bolsa. As empresas têm pesos diferentes no índice conforme sua importância no mercado (valor de mercado e liquidez).

**Critérios para uma ação entrar no Ibovespa:**

• Estar entre as mais negociadas
• Ter presença em pelo menos 95% dos pregões
• Não ser penny stock
• Cumprir requisitos de liquidez

**Principais empresas do Ibovespa:**

Vale, Petrobras, Itaú, Bradesco, Ambev, Magazine Luiza, entre outras. Essas empresas juntas representam boa parte do índice.

**Para que serve:**

• Medir a performance geral do mercado de ações brasileiro
• Servir de benchmark para fundos e investidores
• Indicador da confiança dos investidores na economia
• Base para contratos futuros e ETFs

**Pontos vs. Retorno:**

Quando ouvimos "Ibovespa fechou em 120.000 pontos", o número absoluto importa menos que a variação percentual. O importante é comparar com períodos anteriores.

**Rebalanceamento:**

A cada 4 meses, a B3 revisa a composição do índice, podendo incluir ou excluir ações conforme critérios de liquidez.`,
    exemplo:
      'Se o Ibovespa estava em 100.000 pontos no início do ano e terminou em 110.000, houve valorização de 10% no período. Isso significa que, em média, as principais ações subiram 10%.',
    comoUsar:
      'Use o Ibovespa como referência para avaliar sua carteira. Se o Ibovespa subiu 20% no ano e sua carteira subiu apenas 5%, talvez seja hora de revisar sua estratégia.',
    relacionados: [
      'b3',
      'ifix',
      'etf',
      'benchmark',
      'blue-chips',
    ],
    palavrasChave: [
      'ibovespa',
      'ibov',
      'índice',
      'bolsa',
      'b3',
      'bovespa',
    ],
  },

  // ========================================
  // TERMOS GERAIS E BÁSICOS
  // ========================================
  {
    slug: 'dividendos',
    nome: 'Dividendos',
    sigla: null,
    categoria: 'geral',
    definicaoResumida:
      'Dividendos são a distribuição de parte dos lucros da empresa para os acionistas. É uma forma de remuneração por ser sócio da empresa.',
    definicaoCompleta: `Dividendos são a parcela do lucro líquido de uma empresa que é distribuída aos acionistas. Quando você compra uma ação, você se torna sócio da empresa e tem direito a receber parte dos lucros.

**Como funcionam:**

Quando uma empresa lucra, ela pode:
1. Reinvestir o lucro no negócio (expansão, novos projetos)
2. Distribuir aos acionistas na forma de dividendos
3. Uma combinação dos dois

**Tipos de proventos:**

• **Dividendos:** pagamento em dinheiro
• **JCP (Juros sobre Capital Próprio):** similar aos dividendos, mas com tratamento fiscal diferente
• **Bonificação:** distribuição de novas ações
• **Direito de Subscrição:** direito de comprar novas ações

**Datas importantes:**

• **Data COM:** último dia para comprar e ter direito ao dividendo
• **Data EX:** primeiro dia que a ação negocia sem direito ao dividendo
• **Data de Pagamento:** quando o dinheiro cai na conta

**Tributação:**

Dividendos são **isentos de Imposto de Renda** para pessoas físicas no Brasil. Já os JCP têm retenção de 15% na fonte.

**Dividend Yield:**

É o indicador que mostra quanto você recebe de dividendos em relação ao preço da ação. Exemplo: se uma ação custa R$ 100 e paga R$ 8/ano em dividendos, o DY é 8%.`,
    exemplo:
      'Você tem 100 ações de ITUB4 compradas a R$ 30 cada. A empresa anuncia dividendos de R$ 0,50 por ação. Você receberá R$ 50 (100 ações × R$ 0,50) na sua conta da corretora, sem descontos.',
    atencao:
      'Dividendo alto não significa necessariamente boa empresa. Verifique se a empresa consegue sustentar esses pagamentos. Empresas em crescimento podem pagar menos dividendos porque reinvestem mais.',
    comoUsar:
      'Use dividendos para gerar renda passiva. Reinvista para acelerar crescimento patrimonial. Na Redentia, acompanhe o histórico de dividendos e o dividend yield de todas as ações e FIIs.',
    relacionados: [
      'dividend-yield',
      'jscp',
      'proventos',
      'payout',
      'fii',
    ],
    palavrasChave: [
      'dividendos',
      'proventos',
      'renda passiva',
      'lucros',
      'distribuição',
    ],
  },
  {
    slug: 'liquidez',
    nome: 'Liquidez',
    sigla: null,
    categoria: 'geral',
    definicaoResumida:
      'Liquidez é a facilidade de converter um ativo em dinheiro rapidamente sem perda significativa de valor. Ativos com alta liquidez podem ser vendidos facilmente.',
    definicaoCompleta: `Liquidez é um conceito fundamental em investimentos que se refere à velocidade e facilidade com que você consegue vender um ativo e transformá-lo em dinheiro.

**Níveis de liquidez:**

• **Alta liquidez:** dinheiro em conta, ações de grandes empresas (blue chips), Tesouro Selic
• **Média liquidez:** ações de médias empresas, FIIs populares, CDBs com liquidez diária
• **Baixa liquidez:** imóveis físicos, small caps, FIIs de nicho, títulos privados sem liquidez

**Por que liquidez importa:**

• Permite resgatar dinheiro em emergências
• Facilita rebalanceamento de carteira
• Reduz spread (diferença entre compra e venda)
• Evita vendas com grandes descontos

**Indicadores de liquidez na bolsa:**

• **Volume diário:** quantidade de dinheiro negociada
• **Quantidade de negócios:** número de operações
• **Spread bid-ask:** diferença entre melhor oferta de compra e venda

**Liquidez vs Rentabilidade:**

Geralmente existe trade-off: ativos mais líquidos tendem a ter menor rentabilidade. Imóveis têm baixa liquidez mas podem dar bons retornos. É importante balancear.

**Reserva de emergência:**

Deve estar sempre em ativos de alta liquidez (conta, Tesouro Selic, CDB com liquidez diária) para poder usar quando precisar.`,
    exemplo:
      'PETR4 tem alta liquidez: você consegue vender milhões de reais a qualquer momento no horário de pregão sem afetar muito o preço. Já um FII pequeno pode ter baixa liquidez: se você tentar vender R$ 100mil de uma vez, pode não encontrar compradores ou ter que dar desconto.',
    atencao:
      'Não invista todo seu dinheiro em ativos ilíquidos. Mantenha sempre uma reserva de emergência líquida (6-12 meses de despesas). Em momentos de crise, a liquidez some rapidamente.',
    comoUsar:
      'Divida sua carteira considerando liquidez: reserva de emergência (alta liquidez), investimentos de médio prazo (média liquidez), longo prazo (pode aceitar baixa liquidez).',
    relacionados: [
      'volatilidade',
      'spread',
      'volume',
      'reserva-emergencia',
    ],
    palavrasChave: [
      'liquidez',
      'facilidade venda',
      'conversão dinheiro',
      'volume',
    ],
  },
  {
    slug: 'volatilidade',
    nome: 'Volatilidade',
    sigla: null,
    categoria: 'geral',
    definicaoResumida:
      'Volatilidade é a medida da variação de preço de um ativo em determinado período. Ativos voláteis têm grandes oscilações; ativos estáveis têm pequenas variações.',
    definicaoCompleta: `Volatilidade é uma medida estatística que indica o quanto o preço de um ativo varia ao longo do tempo. É um dos principais indicadores de risco em investimentos.

**Como funciona:**

• **Alta volatilidade:** preços sobem e descem muito (ex: criptomoedas, small caps)
• **Baixa volatilidade:** preços variam pouco (ex: Tesouro Direto, ações de utilities)

**Medição:**

Normalmente usa-se o desvio padrão dos retornos. Um ativo com volatilidade de 30% ao ano pode facilmente variar 30% para cima ou para baixo em um ano.

**Volatilidade não é risco:**

Muitos confundem, mas são conceitos diferentes:
• **Volatilidade:** oscilação de preço (pode ser temporária)
• **Risco:** chance de perda permanente de capital

Um ativo pode ser volátil mas seguro no longo prazo (ex: ações de boas empresas que oscilam mas crescem).

**Oportunidade vs. Risco:**

Para investidores de longo prazo, volatilidade pode ser oportunidade:
• Permite comprar barato em momentos de queda
• Buy and hold se beneficia de oscilações
• Dollar cost averaging reduz impacto da volatilidade

Para traders de curto prazo, volatilidade é risco:
• Pode forçar stop loss
• Gera stress emocional
• Dificulta timing de entrada e saída

**Beta:**

Mede a volatilidade de uma ação em relação ao mercado (Ibovespa). Beta > 1 significa mais volátil que o mercado.`,
    exemplo:
      'Ação A: varia entre R$ 90 e R$ 110 em um mês (alta volatilidade). Ação B: varia entre R$ 98 e R$ 102 no mesmo mês (baixa volatilidade). A ação A tem maior volatilidade, mas não necessariamente é pior investimento - depende do seu perfil e prazo.',
    atencao:
      'Se você não aguenta ver sua carteira oscilar 20-30%, evite ações de alta volatilidade. Prefira ativos mais estáveis ou invista apenas o que pode deixar por muitos anos.',
    comoUsar:
      'Ajuste sua carteira ao seu perfil: conservadores devem ter mais ativos de baixa volatilidade. Agressivos podem tolerar alta volatilidade. Use volatilidade a seu favor comprando na baixa.',
    relacionados: [
      'risco',
      'beta',
      'diversificacao',
      'liquidez',
      'small-caps',
    ],
    palavrasChave: [
      'volatilidade',
      'oscilação',
      'variação preço',
      'risco',
      'desvio padrão',
    ],
  },

  // ========================================
  // MAIS INDICADORES FINANCEIROS
  // ========================================
  {
    slug: 'ebit',
    nome: 'EBIT',
    sigla: 'EBIT',
    categoria: 'indicador',
    definicaoResumida:
      'EBIT (Earnings Before Interest and Taxes) é o lucro operacional antes de juros e impostos. Mede o resultado da atividade principal da empresa.',
    definicaoCompleta: `O EBIT representa o lucro gerado pela operação da empresa, antes de considerar despesas financeiras (juros) e impostos. É um indicador importante porque mostra a eficiência do negócio em si, independentemente da estrutura de capital e do regime tributário.

**Por que é importante?**

• Permite comparar empresas com diferentes níveis de endividamento
• Foca na eficiência operacional pura
• Útil para análise de empresas em diferentes países (diferentes impostos)
• Base para cálculo de múltiplos como EV/EBIT

**Diferença entre EBIT e Lucro Líquido:**

O lucro líquido considera juros e impostos. O EBIT não. Por isso, o EBIT é melhor para avaliar a operação pura da empresa, enquanto o lucro líquido mostra o resultado final para o acionista.

**Quando usar:**

Use EBIT para comparar a eficiência operacional de empresas do mesmo setor, independente de como cada uma se financia (capital próprio vs dívida).`,
    formula: 'EBIT = Lucro Líquido + Despesas Financeiras + Impostos',
    exemplo:
      'Se uma empresa tem receita de R$ 1 milhão, custos operacionais de R$ 600 mil, o EBIT é R$ 400 mil. Depois, ela paga R$ 50 mil de juros e R$ 100 mil de impostos, sobrando R$ 250 mil de lucro líquido.',
    relacionados: ['ebitda', 'ev-ebit', 'margem-ebit', 'lucro-liquido'],
    palavrasChave: ['ebit', 'lucro operacional', 'earnings', 'resultado operacional'],
  },
  {
    slug: 'roa',
    nome: 'ROA',
    sigla: 'ROA',
    categoria: 'indicador',
    definicaoResumida:
      'ROA (Return on Assets) mede a capacidade da empresa de gerar lucro a partir de seus ativos totais. Indica eficiência na utilização dos recursos.',
    definicaoCompleta: `O ROA mostra quanto de lucro a empresa gera para cada real investido em ativos (máquinas, imóveis, estoque, etc.). É um indicador de eficiência na utilização de recursos.

**Como interpretar:**

• ROA alto (> 10%): empresa eficiente na geração de lucro com seus ativos
• ROA médio (5-10%): razoável
• ROA baixo (< 5%): empresa pouco eficiente ou capital intensivo

**ROA vs ROE:**

ROE mede retorno sobre o patrimônio líquido (capital dos acionistas). ROA mede retorno sobre todos os ativos (próprios + financiados). ROA geralmente é menor que ROE em empresas alavancadas.

**Setores com ROA naturalmente baixo:**

Empresas capital-intensivas (siderúrgicas, elétricas) tendem a ter ROA menor. Compare sempre com empresas do mesmo setor.`,
    formula: 'ROA = (Lucro Líquido ÷ Ativo Total) × 100',
    exemplo:
      'Se uma empresa tem lucro de R$ 50 milhões e ativo total de R$ 500 milhões, o ROA é 10% (50 ÷ 500 = 0,10). Cada R$ 100 de ativos gera R$ 10 de lucro.',
    relacionados: ['roe', 'roic', 'margem-liquida', 'eficiencia'],
    palavrasChave: ['roa', 'return on assets', 'retorno sobre ativos', 'rentabilidade'],
  },
  {
    slug: 'roic',
    nome: 'ROIC',
    sigla: 'ROIC',
    categoria: 'indicador',
    definicaoResumida:
      'ROIC (Return on Invested Capital) mede o retorno sobre o capital total investido na empresa. Indica se a empresa cria ou destrói valor.',
    definicaoCompleta: `O ROIC é considerado por muitos analistas o melhor indicador de rentabilidade, pois mostra o retorno sobre todo o capital investido no negócio (próprio + terceiros).

**Por que ROIC é importante?**

Ele responde: "A empresa gera retorno superior ao custo de capital?"
• Se ROIC > WACC: empresa cria valor
• Se ROIC < WACC: empresa destrói valor

**ROIC vs ROE:**

ROE pode ser inflado por alavancagem (dívida). ROIC é mais honesto porque considera todo o capital, não só o dos acionistas.

**Como usar:**

Procure empresas com ROIC consistentemente alto (> 15-20%) e crescente ao longo dos anos. São sinais de vantagens competitivas duradouras.

Warren Buffett e grandes investidores valorizam muito empresas com ROIC alto e sustentável.`,
    formula: 'ROIC = NOPAT ÷ Capital Investido',
    exemplo:
      'Se uma empresa tem NOPAT de R$ 100 milhões e capital investido de R$ 500 milhões, o ROIC é 20%. Se o custo de capital (WACC) é 10%, ela está criando valor.',
    atencao:
      'Compare ROIC com o WACC da empresa. Um ROIC de 12% pode ser bom se o WACC for 8%, mas ruim se o WACC for 15%.',
    relacionados: ['roe', 'roa', 'wacc', 'nopat', 'valor-economico'],
    palavrasChave: ['roic', 'return on invested capital', 'retorno capital investido', 'criação de valor'],
  },
  {
    slug: 'lpa',
    nome: 'LPA',
    sigla: 'LPA',
    categoria: 'indicador',
    definicaoResumida:
      'LPA (Lucro por Ação) é o lucro líquido da empresa dividido pelo número de ações. Mostra quanto lucro cada ação gerou no período.',
    definicaoCompleta: `O LPA é um dos indicadores mais básicos e importantes. Ele mostra quanto de lucro foi gerado para cada ação da empresa.

**Por que é importante?**

• Base para calcular o P/L (Preço ÷ LPA)
• Permite comparar lucro entre empresas de diferentes tamanhos
• Mostra evolução do lucro ao longo do tempo
• Usado para projetar dividendos futuros

**LPA crescente = bom sinal:**

Empresas que aumentam consistentemente o LPA ano após ano tendem a valorizar suas ações no longo prazo.

**Cuidados:**

• Desdobramentos e grupamentos de ações afetam o LPA
• Compare sempre LPA de períodos iguais (trimestre vs trimestre, ano vs ano)
• LPA negativo indica prejuízo`,
    formula: 'LPA = Lucro Líquido ÷ Número Total de Ações',
    exemplo:
      'Se uma empresa lucrou R$ 1 bilhão e tem 100 milhões de ações, o LPA é R$ 10 (1.000.000.000 ÷ 100.000.000).',
    relacionados: ['p-l', 'lucro-liquido', 'vpa', 'dividendos'],
    palavrasChave: ['lpa', 'lucro por ação', 'earnings per share', 'eps'],
  },
  {
    slug: 'vpa',
    nome: 'VPA',
    sigla: 'VPA',
    categoria: 'indicador',
    definicaoResumida:
      'VPA (Valor Patrimonial por Ação) é o patrimônio líquido da empresa dividido pelo número de ações. Indica quanto cada ação "vale" em termos patrimoniais.',
    definicaoCompleta: `O VPA mostra o valor contábil de cada ação. Se a empresa fosse liquidada hoje e todos os ativos vendidos pelo valor de balanço, quanto cada ação receberia?

**Como usar:**

• Base para calcular P/VP (Preço ÷ VPA)
• Comparar com o preço de mercado
• Avaliar se a ação está barata ou cara em relação ao patrimônio

**VPA vs Preço:**

• Preço < VPA: ação negociada com desconto
• Preço = VPA: valor justo patrimonial
• Preço > VPA: mercado paga prêmio (espera crescimento ou empresa tem ativos intangíveis)

**Limitações:**

VPA é baseado em valores contábeis, que podem estar defasados. Uma marca valiosa pode não aparecer no balanço.`,
    formula: 'VPA = Patrimônio Líquido ÷ Número Total de Ações',
    exemplo:
      'Se uma empresa tem patrimônio líquido de R$ 3 bilhões e 100 milhões de ações, o VPA é R$ 30 por ação.',
    relacionados: ['p-vp', 'patrimonio-liquido', 'lpa', 'valor-contabil'],
    palavrasChave: ['vpa', 'valor patrimonial por ação', 'book value', 'valor contábil'],
  },
  {
    slug: 'payout',
    nome: 'Payout',
    sigla: null,
    categoria: 'indicador',
    definicaoResumida:
      'Payout é o percentual do lucro líquido que a empresa distribui como dividendos aos acionistas. Indica a política de distribuição de lucros.',
    definicaoCompleta: `O Payout mostra quanto do lucro é devolvido aos acionistas e quanto é reinvestido na empresa.

**Como interpretar:**

• Payout alto (80-100%): empresa madura, distribui quase tudo
• Payout médio (40-60%): equilibrado
• Payout baixo (0-30%): empresa em crescimento, reinveste muito

**Payout de FIIs:**

FIIs são obrigados por lei a distribuir pelo menos 95% dos lucros, então têm payout muito alto.

**Sustentabilidade:**

Verifique se a empresa consegue manter o payout. Um payout de 150% significa que está distribuindo mais que o lucro (insustentável).

**Crescimento vs Dividendos:**

Empresas em crescimento (tech, varejo em expansão) tendem a ter payout baixo. Empresas maduras (bancos, utilities) têm payout alto.`,
    formula: 'Payout = (Dividendos Pagos ÷ Lucro Líquido) × 100',
    exemplo:
      'Se uma empresa lucrou R$ 100 milhões e distribuiu R$ 60 milhões em dividendos, o payout é 60%.',
    atencao:
      'Payout acima de 100% não é sustentável no longo prazo. A empresa está pagando dividendos com reservas ou dívida.',
    relacionados: ['dividendos', 'dividend-yield', 'jscp', 'lucro-liquido'],
    palavrasChave: ['payout', 'distribuição lucros', 'taxa distribuição', 'dividendos'],
  },

  // ========================================
  // AÇÕES E MERCADO
  // ========================================
  {
    slug: 'ipo',
    nome: 'IPO',
    sigla: 'IPO',
    categoria: 'acao',
    definicaoResumida:
      'IPO (Initial Public Offering) é a oferta pública inicial de ações. Momento em que uma empresa abre capital e passa a negociar na bolsa.',
    definicaoCompleta: `O IPO é o processo pelo qual uma empresa privada passa a ser pública, vendendo ações pela primeira vez na bolsa de valores.

**Por que empresas fazem IPO?**

• Captar recursos para crescimento
• Permitir que fundadores e investidores vendam suas participações
• Aumentar visibilidade e credibilidade
• Facilitar fusões e aquisições

**Processo:**

1. Empresa contrata banco de investimentos
2. Prepara documentação (prospecto)
3. Define preço inicial
4. Vende ações ao público
5. Ações começam a negociar na bolsa

**Para investidores:**

IPOs podem ser oportunidades, mas também riscos. Empresas novas na bolsa têm menos histórico para análise.

**Casos famosos no Brasil:**

Magazine Luiza (2011), Nubank (2021), entre outros.`,
    exemplo:
      'A Nubank fez IPO em dezembro de 2021 na NYSE. O preço inicial foi US$ 9, valorizando a empresa em ~US$ 40 bilhões.',
    atencao:
      'Muitos IPOs têm performance ruim no primeiro ano. Espere a empresa ter alguns trimestres de resultados públicos antes de investir.',
    relacionados: ['oferta-publica', 'follow-on', 'b3', 'mercado-primario'],
    palavrasChave: ['ipo', 'oferta pública inicial', 'abertura capital', 'listing'],
  },
  {
    slug: 'blue-chips',
    nome: 'Blue Chips',
    sigla: null,
    categoria: 'acao',
    definicaoResumida:
      'Blue Chips são ações de empresas grandes, consolidadas e líderes de mercado. Geralmente têm alta liquidez e menor volatilidade.',
    definicaoCompleta: `Blue Chips é um termo que vem do pôquer (fichas azuis são as mais valiosas) e se refere às ações de empresas sólidas e bem estabelecidas.

**Características:**

• Empresas líderes em seus setores
• Alto valor de mercado
• Liquidez elevada (fácil comprar e vender)
• Histórico consistente de lucros
• Pagadoras regulares de dividendos

**Exemplos no Brasil:**

• VALE3 (Vale)
• PETR4 (Petrobras)
• ITUB4 (Itaú)
• BBDC4 (Bradesco)
• WEGE3 (WEG)
• BBAS3 (Banco do Brasil)

**Vantagens:**

• Menor risco que small caps
• Boa liquidez
• Empresas bem conhecidas e analisadas

**Desvantagens:**

• Menor potencial de crescimento explosivo
• Já estão bem precificadas pelo mercado`,
    relacionados: ['small-caps', 'ibovespa', 'liquidez', 'mid-caps'],
    palavrasChave: ['blue chips', 'ações grandes', 'empresas consolidadas', 'líderes mercado'],
  },
  {
    slug: 'small-caps',
    nome: 'Small Caps',
    sigla: null,
    categoria: 'acao',
    definicaoResumida:
      'Small Caps são ações de empresas pequenas em valor de mercado. Têm maior potencial de crescimento, mas também maior risco e volatilidade.',
    definicaoCompleta: `Small Caps são empresas com baixo valor de mercado (market cap), geralmente abaixo de R$ 2-5 bilhões no Brasil.

**Características:**

• Menor cobertura de analistas
• Menor liquidez (mais difícil comprar/vender grandes volumes)
• Maior volatilidade de preço
• Maior potencial de crescimento
• Maior risco

**Por que investir?**

Small caps podem se tornar as blue chips do futuro. Investir cedo em uma empresa em crescimento pode gerar retornos extraordinários.

**Riscos:**

• Mais suscetíveis a crises
• Risco de descontinuidade
• Menor transparência
• Dificuldade de venda rápida

**Como investir:**

• Diversifique (não coloque tudo em small caps)
• Estude muito antes de investir
• Tenha horizonte de longo prazo
• Aceite volatilidade`,
    exemplo:
      'Uma empresa com valor de mercado de R$ 500 milhões que cresce 50% ao ano pode facilmente multiplicar de valor. Mas também pode quebrar.',
    atencao:
      'Small caps não são para iniciantes. Exigem mais conhecimento, estômago para volatilidade e diversificação.',
    relacionados: ['blue-chips', 'mid-caps', 'volatilidade', 'risco', 'valor-mercado'],
    palavrasChave: ['small caps', 'empresas pequenas', 'baixo valor mercado', 'crescimento'],
  },

  // ========================================
  // MAIS TERMOS GERAIS
  // ========================================
  {
    slug: 'etf',
    nome: 'ETF',
    sigla: 'ETF',
    categoria: 'acao',
    definicaoResumida:
      'ETF (Exchange Traded Fund) é um fundo de índice negociado em bolsa. Replica o desempenho de um índice como o Ibovespa, facilitando diversificação.',
    definicaoCompleta: `ETFs são fundos que replicam índices de mercado e são negociados na bolsa como se fossem ações.

**Como funcionam:**

Ao comprar uma cota de ETF de Ibovespa (BOVA11), você está comprando todas as ações do índice na mesma proporção, com um único clique.

**Vantagens:**

• Diversificação instantânea
• Taxas baixas (gestão passiva)
• Liquidez (compra e vende como ação)
• Transparência total

**Tipos de ETFs no Brasil:**

• BOVA11: replica Ibovespa
• SMAL11: small caps
• IVVB11: S&P 500 em reais
• PIBB11: IBrX-50
• E muitos outros (ouro, títulos, setores)

**ETF vs Fundo tradicional:**

ETFs têm taxas menores e são mais líquidos que fundos de ações tradicionais.`,
    exemplo:
      'Com R$ 1.000, você pode comprar cotas de BOVA11 e ter exposição a todas as empresas do Ibovespa, em vez de escolher ações individualmente.',
    relacionados: ['ibovespa', 'indice', 'diversificacao', 'gestao-passiva'],
    palavrasChave: ['etf', 'fundo índice', 'exchange traded fund', 'bova11'],
  },
  {
    slug: 'jscp',
    nome: 'Juros sobre Capital Próprio',
    sigla: 'JCP',
    categoria: 'geral',
    definicaoResumida:
      'JCP (Juros sobre Capital Próprio) é uma forma de remuneração aos acionistas, similar aos dividendos, mas com tratamento fiscal diferente.',
    definicaoCompleta: `Os JCP são uma alternativa aos dividendos. A empresa remunera os acionistas como se estivesse pagando juros sobre o capital que eles investiram.

**Diferença entre JCP e Dividendos:**

**Dividendos:**
• Isentos de IR para pessoa física
• Pagos do lucro líquido (após impostos)

**JCP:**
• Retém 15% de IR na fonte
• Dedutível para a empresa (reduz base de cálculo de impostos)
• Geralmente mais vantajoso para a empresa

**Para o investidor:**

Na prática, ambos são proventos. O JCP vem com 15% de IR retido, mas o valor bruto costuma ser maior para compensar.

**Exemplo numérico:**

Empresa decide distribuir R$ 100:
• Se pagar dividendos: você recebe R$ 100
• Se pagar JCP: você recebe R$ 85 (R$ 100 - 15% IR), mas empresa deduz os R$ 100 do imposto dela`,
    relacionados: ['dividendos', 'proventos', 'dividend-yield', 'payout'],
    palavrasChave: ['jcp', 'juros capital próprio', 'proventos', 'remuneração acionista'],
  },
  {
    slug: 'tag-along',
    nome: 'Tag Along',
    sigla: null,
    categoria: 'acao',
    definicaoResumida:
      'Tag Along é o direito de acionistas minoritários de vender suas ações nas mesmas condições dos controladores em caso de venda de controle da empresa.',
    definicaoCompleta: `Tag Along protege acionistas minoritários. Se o controlador vende sua participação, os minoritários também podem vender pelo mesmo preço (ou percentual dele).

**Como funciona:**

Imagine que o controlador vende suas ações por R$ 50/ação para um comprador. Se há tag along de 100%, você também pode vender suas ações por R$ 50. Se for 80%, você vende por R$ 40.

**Níveis de Tag Along:**

• Novo Mercado: 100% para ações ON e PN
• Nível 2: 100% para ON, 80% para PN  
• Nível 1: 80% para ON, sem obrigação para PN
• Tradicional: 80% ON (mínimo legal), sem garantia para PN

**Por que é importante:**

Evita que controladores vendam por um prêmio alto e deixem os minoritários com ações desvalorizadas sob novo controle.`,
    exemplo:
      'Empresa X do Novo Mercado tem ações a R$ 30. Controlador recebe oferta de R$ 50/ação. Com tag along 100%, você também pode vender por R$ 50.',
    relacionados: ['acoes-on-pn', 'novo-mercado', 'governanca', 'minoritarios'],
    palavrasChave: ['tag along', 'direito venda', 'minoritários', 'proteção investidor'],
  },
  {
    slug: 'day-trade',
    nome: 'Day Trade',
    sigla: null,
    categoria: 'estrategia',
    definicaoResumida:
      'Day Trade é a estratégia de comprar e vender ativos no mesmo dia, buscando lucrar com oscilações de curto prazo. Operações são encerradas antes do fechamento do pregão.',
    definicaoCompleta: `Day Trade é uma modalidade operacional onde todas as posições são abertas e fechadas no mesmo dia. O trader não carrega posições de um dia para o outro.

**Características:**

• Alta frequência de operações
• Foco em gráficos de curto prazo (minutos, horas)
• Usa análise técnica intensivamente
• Alavancagem comum
• Risco alto

**Tributação:**

Diferente de investimento normal (15-20% só na venda), day trade tem:
• 20% de IR sobre lucro (maior alíquota)
• Retenção de 1% na fonte em cada operação
• Declaração mensal obrigatória se houver lucro

**Requisitos:**

• Capital inicial razoável (mínimo R$ 5-10 mil recomendado)
• Tempo dedicado (acompanhar mercado em tempo real)
• Controle emocional
• Conhecimento técnico avançado

**Estatística dura:**

Estudos mostram que 90-95% dos day traders perdem dinheiro no longo prazo. É uma atividade de altíssimo risco.`,
    atencao:
      'Day trade NÃO é investimento, é especulação. Maioria perde dinheiro. Se você é iniciante, foque em buy and hold primeiro.',
    relacionados: ['swing-trade', 'stop-loss', 'analise-tecnica', 'alavancagem'],
    palavrasChave: ['day trade', 'trader', 'curto prazo', 'especulação', 'intraday'],
  },
  {
    slug: 'swing-trade',
    nome: 'Swing Trade',
    sigla: null,
    categoria: 'estrategia',
    definicaoResumida:
      'Swing Trade é a estratégia de manter posições por dias ou semanas, buscando capturar movimentos de médio prazo. Entre day trade e buy and hold.',
    definicaoCompleta: `Swing Trade é uma estratégia intermediária: mais longa que day trade, mais curta que buy and hold.

**Horizonte típico:**

• Posições mantidas de 2 dias a algumas semanas
• Busca capturar "swings" (oscilações) de tendência
• Menos operações que day trade

**Tributação:**

15% de IR sobre lucro em vendas acima de R$ 20 mil/mês (igual buy and hold), mas como opera mais, paga mais imposto no total.

**Análise:**

Combina análise técnica (gráficos, indicadores) com fundamentos básicos da empresa.

**Vantagens sobre Day Trade:**

• Menos estresse (não precisa ficar o dia todo na frente do computador)
• Menos custos de corretagem
• Pode trabalhar e fazer swing trade
• Menos tributação que day trade

**Requisitos:**

• Conhecimento de análise técnica
• Disciplina para seguir stop loss e stop gain
• Capital para diversificar`,
    relacionados: ['day-trade', 'buy-and-hold', 'stop-loss', 'analise-tecnica'],
    palavrasChave: ['swing trade', 'médio prazo', 'operações swing', 'trader'],
  },
  {
    slug: 'stop-loss',
    nome: 'Stop Loss',
    sigla: null,
    categoria: 'estrategia',
    definicaoResumida:
      'Stop Loss é uma ordem automática de venda quando o preço atinge determinado nível. Serve para limitar perdas em uma operação.',
    definicaoCompleta: `Stop Loss (parar perda) é uma ferramenta fundamental de gestão de risco. Você define um preço abaixo do qual vende automaticamente para limitar prejuízos.

**Como funciona:**

Comprou PETR4 a R$ 40. Define stop loss em R$ 36 (10% de perda máxima). Se cair para R$ 36, vende automaticamente.

**Por que usar:**

• Protege contra grandes perdas
• Remove emoção da decisão
• Essencial para day trade e swing trade
• Disciplina operacional

**Tipos:**

• **Stop fixo:** preço definido
• **Stop móvel (trailing stop):** acompanha o preço subindo
• **Stop gain:** vende quando atinge lucro alvo

**Cuidados:**

• Não coloque stop muito apertado (pode ser acionado por oscilação normal)
• Considere volatilidade do ativo
• Em ativos ilíquidos, stop pode executar a preço pior

**Exemplo de stop móvel:**

Comprou a R$ 40, stop em R$ 36. Subiu para R$ 50, você move stop para R$ 45. Protege lucro.`,
    atencao:
      'Em quedas bruscas com baixa liquidez, o stop pode executar bem abaixo do preço definido (slippage).',
    relacionados: ['stop-gain', 'swing-trade', 'day-trade', 'gerenciamento-risco'],
    palavrasChave: ['stop loss', 'parar perda', 'ordem stop', 'gerenciamento risco'],
  },
  {
    slug: 'stop-gain',
    nome: 'Stop Gain',
    sigla: null,
    categoria: 'estrategia',
    definicaoResumida:
      'Stop Gain é uma ordem automática de venda quando o preço atinge um objetivo de lucro. Serve para realizar ganhos automaticamente.',
    definicaoCompleta: `Stop Gain (realizar ganho) é o oposto do stop loss. Você define um preço acima do qual vende automaticamente para garantir lucro.

**Como funciona:**

Comprou a R$ 40 esperando que suba para R$ 50. Define stop gain em R$ 48. Se atingir, vende automaticamente e garante ~20% de lucro.

**Por que usar:**

• Realiza lucros sem precisar ficar acompanhando
• Remove ganância da equação
• Disciplina para não ficar esperando "subir mais"
• Reduz ansiedade

**Estratégia combinada:**

Use stop loss E stop gain juntos:
• Compra: R$ 40
• Stop loss: R$ 36 (máximo -10%)
• Stop gain: R$ 48 (objetivo +20%)

Assim você define claramente o risco e o objetivo.

**Desvantagem:**

Se o ativo continuar subindo após seu stop gain, você perde a alta adicional. Mas já realizou lucro planejado.`,
    exemplo:
      'Trader compra VALE3 a R$ 60, stop loss em R$ 54, stop gain em R$ 72. Qualquer um que atingir primeiro, automaticamente executa.',
    relacionados: ['stop-loss', 'swing-trade', 'realizacao-lucro'],
    palavrasChave: ['stop gain', 'realizar lucro', 'objetivo preço', 'alvo'],
  },
  {
    slug: 'benchmark',
    nome: 'Benchmark',
    sigla: null,
    categoria: 'mercado',
    definicaoResumida:
      'Benchmark é um índice de referência usado para comparar o desempenho de investimentos. Serve como parâmetro para avaliar se sua carteira foi bem.',
    definicaoCompleta: `Benchmark é a "régua" que usamos para medir se um investimento ou carteira teve bom desempenho.

**Exemplos de benchmarks:**

• **Renda Variável:** Ibovespa, S&P 500
• **FIIs:** IFIX
• **Renda Fixa:** CDI, IPCA
• **Multimercado:** CDI + algum percentual

**Como usar:**

Se seu fundo de ações rendeu 12% no ano, mas o Ibovespa rendeu 20%, o fundo teve desempenho RUIM (não bateu o benchmark).

**Gestão ativa vs passiva:**

• **Passiva (ETFs):** objetivo é REPLICAR o benchmark
• **Ativa (fundos):** objetivo é SUPERAR o benchmark

**Consistência importa:**

Avalie se o investimento bate o benchmark consistentemente ao longo de vários anos, não só um ano.

**Seu benchmark pessoal:**

Você pode definir seu próprio: "Quero bater CDI + 5% ao ano" ou "Quero superar Ibovespa"`,
    exemplo:
      'Fundo XYZ rendeu 15% em 2024. CDI rendeu 13,75%. O fundo bateu o benchmark em 1,25 p.p. (pontos percentuais).',
    relacionados: ['ibovespa', 'ifix', 'cdi', 'gestao-ativa', 'etf'],
    palavrasChave: ['benchmark', 'referência', 'índice comparação', 'performance'],
  },
  {
    slug: 'liquidez-corrente',
    nome: 'Liquidez Corrente',
    sigla: null,
    categoria: 'indicador',
    definicaoResumida:
      'Liquidez Corrente mede a capacidade da empresa de pagar suas dívidas de curto prazo com seus ativos de curto prazo. Indica saúde financeira.',
    definicaoCompleta: `A Liquidez Corrente mostra se a empresa tem recursos suficientes para pagar suas obrigações de curto prazo (até 1 ano).

**Como interpretar:**

• Liquidez < 1: empresa tem menos ativos que dívidas de curto prazo (risco!)
• Liquidez = 1: ativos iguais às dívidas
• Liquidez > 1: empresa confortável
• Liquidez > 2: muito confortável (ou com capital parado)

**Fórmula:**

Divide ativos circulantes (caixa, estoque, contas a receber) por passivos circulantes (dívidas de curto prazo).

**Cuidados:**

• Empresas de varejo têm liquidez menor (operam com pouco caixa)
• Empresas de tecnologia/serviços têm liquidez maior
• Compare com empresas do mesmo setor

**Outros indicadores de liquidez:**

• Liquidez Seca: exclui estoques (mais conservadora)
• Liquidez Imediata: só caixa e equivalentes`,
    formula: 'Liquidez Corrente = Ativo Circulante ÷ Passivo Circulante',
    exemplo:
      'Empresa tem R$ 500 mil em caixa + estoque, e R$ 300 mil em dívidas de curto prazo. Liquidez = 1,67 (500/300). Para cada R$ 1 de dívida, tem R$ 1,67 de ativos.',
    relacionados: ['liquidez-seca', 'capital-giro', 'ativo-circulante', 'passivo-circulante'],
    palavrasChave: ['liquidez corrente', 'índice liquidez', 'saúde financeira', 'curto prazo'],
  },
  {
    slug: 'margem-liquida',
    nome: 'Margem Líquida',
    sigla: null,
    categoria: 'indicador',
    definicaoResumida:
      'Margem Líquida é o percentual de lucro líquido em relação à receita. Mostra quanto sobra de cada real vendido após todos os custos e impostos.',
    definicaoCompleta: `A Margem Líquida indica a eficiência final da empresa em converter receita em lucro.

**Como calcular:**

Divide lucro líquido por receita líquida. Se uma empresa fatura R$ 100 e lucra R$ 10, a margem líquida é 10%.

**Interpretação:**

• Margem alta (> 20%): empresa muito lucrativa (tech, farmacêuticas)
• Margem média (10-20%): boa
• Margem baixa (< 5%): pouco lucrativa (varejo, commodities)

**Varia muito por setor:**

• Software: 20-40%
• Bancos: 15-30%
• Varejo: 2-5%
• Commodities: 5-15%

**Margem crescente = bom sinal:**

Empresas que aumentam margem ao longo do tempo estão ficando mais eficientes ou ganhando poder de precificação.

**Relação com ROE:**

Margem alta + giro de ativos alto = ROE alto`,
    formula: 'Margem Líquida = (Lucro Líquido ÷ Receita Líquida) × 100',
    exemplo:
      'Magazine Luiza fatura R$ 10 bilhões e lucra R$ 300 milhões. Margem líquida = 3%. Típico de varejo. Google tem margem de ~25%.',
    relacionados: ['margem-bruta', 'margem-ebitda', 'lucro-liquido', 'roe'],
    palavrasChave: ['margem líquida', 'rentabilidade', 'lucratividade', 'margem lucro'],
  },
  {
    slug: 'margem-bruta',
    nome: 'Margem Bruta',
    sigla: null,
    categoria: 'indicador',
    definicaoResumida:
      'Margem Bruta é o percentual de lucro bruto sobre a receita. Mostra quanto sobra após deduzir apenas os custos diretos dos produtos vendidos.',
    definicaoCompleta: `A Margem Bruta é um indicador de rentabilidade que mostra a eficiência da empresa em produzir/vender sem considerar despesas operacionais, financeiras e impostos.

**O que inclui:**

• Receita de vendas
• (-) Custo dos produtos vendidos (CPV)
• = Lucro Bruto

**Interpretação:**

• Margem alta (> 50%): empresa tem pricing power ou baixo custo de produção
• Margem média (30-50%): razoável
• Margem baixa (< 20%): competição intensa ou produto commodity

**Setores com margem bruta alta:**

• Software/SaaS: 80-90%
• Farmacêuticas: 70-80%  
• Luxo: 60-70%

**Setores com margem bruta baixa:**

• Supermercados: 20-30%
• Commodities: 15-30%

**Importância:**

Margem bruta alta dá fôlego para a empresa investir em marketing, P&D, expansão.`,
    formula: 'Margem Bruta = (Lucro Bruto ÷ Receita Líquida) × 100',
    exemplo:
      'Loja vende R$ 100 em produtos que custaram R$ 60. Lucro bruto = R$ 40. Margem bruta = 40%.',
    relacionados: ['margem-liquida', 'margem-ebitda', 'lucro-bruto', 'cpv'],
    palavrasChave: ['margem bruta', 'gross margin', 'rentabilidade', 'pricing power'],
  },
  {
    slug: 'valor-mercado',
    nome: 'Valor de Mercado',
    sigla: null,
    categoria: 'geral',
    definicaoResumida:
      'Valor de Mercado (Market Cap) é o valor total de todas as ações da empresa. Calculado multiplicando o preço da ação pelo número total de ações.',
    definicaoCompleta: `O Valor de Mercado mostra quanto a empresa "vale" segundo o mercado de ações.

**Como calcular:**

Preço da ação × Número total de ações

**Classificação:**

• **Mega Cap:** > R$ 100 bilhões (Vale, Petrobras)
• **Large Cap:** R$ 10-100 bilhões (Weg, Localiza)
• **Mid Cap:** R$ 2-10 bilhões
• **Small Cap:** < R$ 2 bilhões

**Valor de Mercado ≠ Valor Real:**

O mercado pode estar otimista (valuation alto) ou pessimista (valuation baixo) sobre a empresa.

**Importância:**

• Define peso em índices (Ibovespa, etc.)
• Indica tamanho e estabilidade
• Afeta liquidez
• Influencia atenção de analistas

**Valor de Mercado vs Enterprise Value:**

Valor de Mercado só considera ações. Enterprise Value soma dívidas e subtrai caixa, mostrando o "preço" total da empresa.`,
    formula: 'Valor de Mercado = Preço da Ação × Número Total de Ações',
    exemplo:
      'Vale tem ~4,6 bilhões de ações a R$ 65 cada. Valor de mercado ≈ R$ 300 bilhões (US$ 60 bi).',
    relacionados: ['enterprise-value', 'capitalizacao', 'small-caps', 'blue-chips'],
    palavrasChave: ['valor de mercado', 'market cap', 'capitalização', 'valuation'],
  },
  {
    slug: 'enterprise-value',
    nome: 'Enterprise Value',
    sigla: 'EV',
    categoria: 'indicador',
    definicaoResumida:
      'Enterprise Value (Valor da Firma) é o valor total da empresa incluindo dívidas e excluindo caixa. Representa o "preço" completo de comprar a empresa.',
    definicaoCompleta: `O Enterprise Value mostra quanto custaria comprar a empresa inteira, assumindo todas as dívidas e ficando com o caixa.

**Como calcular:**

EV = Valor de Mercado + Dívida Total - Caixa e Equivalentes

**Por que somar dívida?**

Se você compra uma empresa, assume suas dívidas.

**Por que subtrair caixa?**

O caixa da empresa passa a ser seu após a compra.

**Exemplo prático:**

Empresa vale R$ 100 bi em ações, tem R$ 20 bi de dívida e R$ 5 bi em caixa.
EV = 100 + 20 - 5 = R$ 115 bilhões

**Uso em valuation:**

• EV/EBITDA: múltiplo muito usado
• EV/EBIT: também comum
• Permite comparar empresas com diferentes estruturas de capital

**EV negativo?**

Raro, mas possível. Significa que o caixa é maior que o valor de mercado + dívida. Pode ser oportunidade ou sinal de problemas.`,
    formula: 'EV = Valor de Mercado + Dívida Total - Caixa',
    relacionados: ['ev-ebitda', 'ev-ebit', 'valor-mercado', 'divida-liquida'],
    palavrasChave: ['enterprise value', 'ev', 'valor firma', 'valor empresa'],
  },

  // ========================================
  // FUNDOS IMOBILIÁRIOS - MAIS TERMOS
  // ========================================
  {
    slug: 'cap-rate',
    nome: 'Cap Rate',
    sigla: null,
    categoria: 'fii',
    definicaoResumida:
      'Cap Rate (Taxa de Capitalização) é a relação entre a renda anual de um imóvel e seu valor de mercado. Indica o retorno potencial do investimento imobiliário.',
    definicaoCompleta: `Cap Rate é um dos indicadores mais importantes para avaliar investimentos imobiliários e FIIs de tijolo.

**Como calcular:**

Cap Rate = (Receita Anual de Aluguéis ÷ Valor do Imóvel) × 100

**Interpretação:**

• Cap Rate alto (> 8%): retorno atrativo ou imóvel em região menos nobre
• Cap Rate médio (6-8%): normal
• Cap Rate baixo (< 6%): retorno menor ou imóvel premium

**Similar ao Dividend Yield:**

Para FIIs, o Cap Rate se assemelha ao dividend yield, mas foca na propriedade em si, não na cota.

**Comparação entre imóveis:**

Use Cap Rate para comparar diferentes imóveis ou FIIs. Quanto maior, melhor o retorno (mas considere riscos).

**Cap Rate vs Risco:**

Cap Rate mais alto pode indicar maior risco (vacância, região, qualidade inquilino). Avalie sempre o contexto.`,
    formula: 'Cap Rate = (Receita Anual de Aluguéis ÷ Valor do Imóvel) × 100',
    exemplo:
      'Galpão logístico vale R$ 50 milhões e gera R$ 4 milhões/ano em aluguéis. Cap Rate = 8%.',
    relacionados: ['fii', 'noi', 'dividend-yield', 'vacancia'],
    palavrasChave: ['cap rate', 'taxa capitalização', 'retorno imobiliário', 'yield imóvel'],
  },
  {
    slug: 'noi',
    nome: 'NOI',
    sigla: 'NOI',
    categoria: 'fii',
    definicaoResumida:
      'NOI (Net Operating Income) é a receita operacional líquida de um imóvel. Receita de aluguéis menos despesas operacionais, antes de impostos e dívidas.',
    definicaoCompleta: `NOI é um conceito fundamental em investimentos imobiliários. Mostra quanto o imóvel realmente gera de caixa operacional.

**Como calcular:**

NOI = Receita de Aluguéis - Despesas Operacionais

**Despesas incluídas:**

• Manutenção
• Seguros
• IPTU
• Taxas de administração
• Utilities (se aplicável)

**Despesas NÃO incluídas:**

• Depreciação (não é caixa)
• Juros de financiamento
• Impostos sobre renda
• Capex (reformas grandes)

**Por que é importante:**

NOI é usado para calcular Cap Rate e avaliar a real capacidade de geração de renda do imóvel.

**NOI crescente:**

Indica que o imóvel está se valorizando e/ou conseguindo reajustar aluguéis acima da inflação.`,
    formula: 'NOI = Receita de Aluguéis - Despesas Operacionais',
    exemplo:
      'Imóvel recebe R$ 500 mil/ano de aluguel, tem R$ 100 mil de despesas. NOI = R$ 400 mil.',
    relacionados: ['cap-rate', 'fii', 'receita-aluguel', 'fundos-tijolo'],
    palavrasChave: ['noi', 'net operating income', 'receita operacional líquida', 'renda imóvel'],
  },
  {
    slug: 'come-cotas',
    nome: 'Come-Cotas',
    sigla: null,
    categoria: 'fii',
    definicaoResumida:
      'Come-Cotas é a antecipação semestral de IR em fundos de investimento. Reduz automaticamente o valor das cotas, sem precisar vender.',
    definicaoCompleta: `O Come-Cotas é um mecanismo de cobrança de Imposto de Renda que ocorre em maio e novembro em alguns fundos.

**Como funciona:**

A cada semestre (último dia útil de maio e novembro), o governo "come" uma parte das suas cotas para antecipar o IR.

**Alíquotas:**

• Fundos de curto prazo: 20%
• Fundos de longo prazo: 15%

Incide sobre o rendimento acumulado no período.

**FIIs estão isentos!**

Fundos imobiliários NÃO sofrem come-cotas. É uma vantagem importante dos FIIs.

**Fundos que sofrem come-cotas:**

• Fundos de renda fixa
• Fundos multimercado
• Fundos de ações (ETFs estão isentos)

**Impacto:**

O valor da sua cota diminui automaticamente, mas você não perde dinheiro de verdade. É só a antecipação do IR que pagaria no resgate.

**Exemplo:**

Você tem 1.000 cotas de R$ 10. Rendeu R$ 500 no semestre. Come-cotas de 15% = R$ 75. Sua cota cai para R$ 9,925, mas você ainda tem o mesmo patrimônio líquido.`,
    atencao:
      'Como FIIs não têm come-cotas, seus rendimentos compostos são mais eficientes que fundos tradicionais.',
    relacionados: ['fii', 'imposto-renda', 'fundos-investimento'],
    palavrasChave: ['come-cotas', 'come cotas', 'ir fundos', 'antecipação imposto'],
  },
  {
    slug: 'fundos-tijolo',
    nome: 'Fundos de Tijolo',
    sigla: null,
    categoria: 'fii',
    definicaoResumida:
      'Fundos de Tijolo são FIIs que investem em imóveis físicos (shoppings, galpões, lajes corporativas). Geram renda através de aluguéis.',
    definicaoCompleta: `Fundos de Tijolo são a categoria mais tradicional de FIIs. Eles possuem imóveis reais que são alugados.

**Tipos de imóveis:**

• **Lajes corporativas:** escritórios comerciais
• **Galpões logísticos:** armazéns, centros de distribuição
• **Shopping centers:** centros comerciais
• **Agências bancárias:** pontos de atendimento
• **Hospitais e escolas:** educação e saúde
• **Hotéis:** hospedagem

**Vantagens:**

• Renda mais estável e previsível
• Contratos de aluguel de longo prazo
• Proteção contra inflação (reajustes)
• Diversificação patrimonial real

**Riscos:**

• Vacância (imóveis vazios)
• Inadimplência de inquilinos
• Desvalorização do imóvel
• Custos de manutenção

**Como avaliar:**

• Taxa de vacância
• Qualidade dos inquilinos
• Localização dos imóveis
• Cap Rate
• Valor patrimonial vs preço da cota`,
    exemplo:
      'HGLG11 (Cshg Logística) é um fundo de tijolo que possui galpões logísticos alugados para grandes empresas.',
    relacionados: ['fii', 'fundos-papel', 'vacancia', 'cap-rate', 'noi'],
    palavrasChave: ['fundos tijolo', 'fiis tijolo', 'imóveis físicos', 'aluguel'],
  },
  {
    slug: 'fundos-papel',
    nome: 'Fundos de Papel',
    sigla: null,
    categoria: 'fii',
    definicaoResumida:
      'Fundos de Papel são FIIs que investem em títulos do setor imobiliário (CRIs, LCIs, debêntures). Funcionam como renda fixa.',
    definicaoCompleta: `Fundos de Papel não possuem imóveis físicos. Eles investem em recebíveis e títulos do setor imobiliário.

**Principais ativos:**

• **CRI (Certificado de Recebíveis Imobiliários):** títulos lastreados em dívidas imobiliárias
• **LCI (Letra de Crédito Imobiliário):** renda fixa de bancos
• **Debêntures:** dívidas de empresas do setor
• **Cotas de outros FIIs**

**Características:**

• Renda geralmente mais alta que fundos de tijolo
• Menos exposto a vacância física
• Mais sensível a juros (marcação a mercado)
• Liquidez dos papéis pode ser menor

**Vantagens:**

• Maior dividend yield inicial
• Menor trabalho operacional (sem imóveis para gerir)
• Diversificação em vários recebíveis

**Riscos:**

• Risco de crédito (inadimplência dos devedores)
• Marcação a mercado (volatilidade do preço da cota)
• Sensibilidade à taxa de juros
• Menos tangível que imóveis físicos`,
    exemplo:
      'KNCR11 (Kinea Rendimentos Imobiliários) é um fundo de papel que investe principalmente em CRIs.',
    relacionados: ['fii', 'fundos-tijolo', 'cri', 'lci', 'renda-fixa'],
    palavrasChave: ['fundos papel', 'fiis papel', 'cri', 'recebíveis imobiliários'],
  },

  // ========================================
  // RENDA FIXA
  // ========================================
  {
    slug: 'tesouro-direto',
    nome: 'Tesouro Direto',
    sigla: null,
    categoria: 'renda-fixa',
    definicaoResumida:
      'Tesouro Direto é o programa do governo federal para venda de títulos públicos a pessoas físicas. É o investimento mais seguro do Brasil.',
    definicaoCompleta: `O Tesouro Direto permite que você empreste dinheiro para o governo e receba juros em troca.

**Tipos de títulos:**

• **Tesouro Selic:** pós-fixado, acompanha a Selic
• **Tesouro IPCA+:** protege da inflação + juro real
• **Tesouro Prefixado:** taxa definida na compra

**Vantagens:**

• Risco soberano (mais seguro do Brasil)
• Aplicação mínima baixa (~R$ 30)
• Liquidez diária
• Diversas opções de prazo
• Proteção do FGC não necessária (governo não quebra)

**Custos:**

• Taxa da B3: 0,20% ao ano sobre valor investido
• IR regressivo: 22,5% (até 180 dias) a 15% (acima de 720 dias)
• Sem taxa de administração se comprar direto

**Quando usar:**

• Reserva de emergência (Tesouro Selic)
• Proteção inflação (Tesouro IPCA+)
• Objetivos de longo prazo (aposentadoria)

**Resgate:**

Pode vender antes do vencimento, mas está sujeito a marcação a mercado (pode ter lucro ou prejuízo).`,
    exemplo:
      'Você compra Tesouro IPCA+ 2035 que paga IPCA + 6% ao ano. Se a inflação for 5%, você receberá 11% ao ano.',
    relacionados: ['tesouro-selic', 'tesouro-ipca', 'renda-fixa', 'titulos-publicos'],
    palavrasChave: ['tesouro direto', 'títulos públicos', 'renda fixa', 'governo'],
  },
  {
    slug: 'cdi',
    nome: 'CDI',
    sigla: 'CDI',
    categoria: 'renda-fixa',
    definicaoResumida:
      'CDI (Certificado de Depósito Interbancário) é a taxa de juros usada em empréstimos entre bancos. Serve como referência para investimentos de renda fixa.',
    definicaoCompleta: `O CDI é uma taxa calculada diariamente pela B3, baseada em empréstimos entre bancos.

**Por que é importante:**

A maioria dos investimentos de renda fixa (CDBs, fundos DI) usa o CDI como referência:
• "Esse CDB rende 110% do CDI"
• "Esse fundo rende 95% do CDI"

**CDI vs Selic:**

• CDI acompanha a Selic de perto (geralmente 0,1 p.p. abaixo)
• CDI: taxa de mercado entre bancos
• Selic: taxa oficial do Banco Central

**Na prática:**

Se a Selic está em 13,75% ao ano, o CDI estará em ~13,65% ao ano.

**Cálculo diário:**

CDI é calculado dia a dia útil e capitalizado. Em 2024, com Selic a 13,75%, o CDI acumulado no ano deve ficar próximo a 13,65%.

**Benchmarking:**

Use o CDI como régua: seu investimento rendeu mais ou menos que o CDI? Se rendeu 100% do CDI, igualou. Se 110%, superou em 10%.`,
    formula: 'Rendimento = Valor × (% do CDI) × (CDI do período)',
    exemplo:
      'Você investe R$ 10.000 em CDB que paga 110% do CDI. Se o CDI render 10% no ano, você receberá 11% (110% de 10%).',
    relacionados: ['selic', 'cdb', 'renda-fixa', 'benchmark'],
    palavrasChave: ['cdi', 'certificado depósito interbancário', 'taxa interbancária', 'referência renda fixa'],
  },
  {
    slug: 'selic',
    nome: 'Taxa Selic',
    sigla: 'Selic',
    categoria: 'renda-fixa',
    definicaoResumida:
      'Selic é a taxa básica de juros da economia brasileira, definida pelo Banco Central. Influencia todos os juros e investimentos do país.',
    definicaoCompleta: `A Taxa Selic é a taxa de juros mais importante do Brasil, definida pelo Copom (Comitê de Política Monetária do BC) a cada 45 dias.

**Para que serve:**

• Controlar inflação (Selic alta desestimula consumo e crédito)
• Referência para todos os juros da economia
• Base para o Tesouro Selic

**Como afeta investimentos:**

• **Renda Fixa:** Selic alta = retornos maiores
• **Ações:** Selic alta = desvalorização (dinheiro migra para renda fixa)
• **FIIs:** Selic alta = dividends yields menos atrativos comparativamente
• **Imóveis:** Selic alta = financiamentos mais caros

**Ciclos:**

BC sobe Selic quando inflação está alta, desce quando economia está fraca.

**História recente:**

• 2016: 14,25% (pico)
• 2020-2021: 2% (mínima histórica)
• 2023: 13,75%
• 2024: tendência de queda

**Acompanhe:**

Reuniões do Copom definem Selic. Mercado especula antes e reage depois.`,
    relacionados: ['cdi', 'tesouro-selic', 'copom', 'banco-central', 'inflacao'],
    palavrasChave: ['selic', 'taxa selic', 'juros básicos', 'banco central', 'copom'],
  },

  // ========================================
  // MAIS INDICADORES ESSENCIAIS
  // ========================================
  {
    slug: 'ev-ebitda',
    nome: 'EV/EBITDA',
    sigla: 'EV/EBITDA',
    categoria: 'indicador',
    definicaoResumida:
      'EV/EBITDA compara o Valor da Firma com o EBITDA. É um dos múltiplos de valuation mais usados por analistas e investidores institucionais.',
    definicaoCompleta: `O EV/EBITDA é considerado um dos melhores múltiplos de valuation porque elimina distorções de estrutura de capital, depreciação e impostos.

**Por que é tão usado?**

• Compara empresas com diferentes níveis de dívida
• Ignora diferenças de depreciação (contábil)
• Facilita comparações internacionais (diferentes impostos)
• Foca no resultado operacional puro

**Como interpretar:**

• EV/EBITDA baixo (< 6): pode estar barata
• EV/EBITDA médio (6-10): valuation normal
• EV/EBITDA alto (> 12): pode estar cara ou tem alto crescimento esperado

**Setores têm médias diferentes:**

• Tecnologia: 10-20x
• Varejo: 6-10x
• Utilities: 8-12x
• Commodities: 4-8x

**Vantagem sobre P/L:**

P/L pode ser distorcido por despesas financeiras. EV/EBITDA olha a operação antes disso.`,
    formula: 'EV/EBITDA = Enterprise Value ÷ EBITDA',
    exemplo:
      'Empresa com EV de R$ 5 bilhões e EBITDA de R$ 500 milhões tem EV/EBITDA de 10x. Levaria 10 anos de EBITDA para "pagar" a empresa.',
    relacionados: ['ev-ebit', 'ebitda', 'enterprise-value', 'valuation'],
    palavrasChave: ['ev/ebitda', 'ev ebitda', 'múltiplo valuation', 'enterprise value'],
  },
  {
    slug: 'p-ebitda',
    nome: 'P/EBITDA',
    sigla: 'P/EBITDA',
    categoria: 'indicador',
    definicaoResumida:
      'P/EBITDA relaciona o valor de mercado com o EBITDA. Similar ao P/L mas usando EBITDA ao invés do lucro líquido.',
    definicaoCompleta: `O P/EBITDA compara o valor de mercado (market cap) da empresa com seu EBITDA.

**Diferença entre P/EBITDA e EV/EBITDA:**

• P/EBITDA: usa valor de mercado (só ações)
• EV/EBITDA: usa enterprise value (ações + dívidas - caixa)

**Quando usar cada um:**

• Use EV/EBITDA para empresas com muita dívida
• P/EBITDA pode ser usado para empresas com pouca dívida

**Interpretação:**

Funciona similar ao P/L:
• P/EBITDA < 7: potencialmente barata
• P/EBITDA 7-12: valuation normal
• P/EBITDA > 12: potencialmente cara

**Vantagem:**

EBITDA é menos volátil que lucro líquido, então P/EBITDA pode ser mais estável que P/L.`,
    formula: 'P/EBITDA = Valor de Mercado ÷ EBITDA',
    relacionados: ['p-l', 'ev-ebitda', 'ebitda', 'valor-mercado'],
    palavrasChave: ['p/ebitda', 'p ebitda', 'preço ebitda', 'valuation'],
  },
  {
    slug: 'p-ebit',
    nome: 'P/EBIT',
    sigla: 'P/EBIT',
    categoria: 'indicador',
    definicaoResumida:
      'P/EBIT relaciona o preço da ação com o EBIT por ação. Mostra quantos anos de lucro operacional são necessários para pagar o preço atual.',
    definicaoCompleta: `O P/EBIT é uma variação do P/L que usa o lucro operacional (EBIT) ao invés do lucro líquido.

**Vantagem sobre P/L:**

Elimina o efeito de:
• Despesas financeiras (juros)
• Impostos
• Permite comparar empresas com diferentes estruturas de capital

**Como calcular:**

P/EBIT = Preço da Ação ÷ EBIT por Ação

Ou em termos de empresa total:
P/EBIT = Valor de Mercado ÷ EBIT Total

**Interpretação:**

• P/EBIT < 10: potencialmente barata
• P/EBIT 10-15: razoável
• P/EBIT > 15: potencialmente cara

Compare sempre com empresas do mesmo setor.`,
    formula: 'P/EBIT = Preço da Ação ÷ EBIT por Ação',
    relacionados: ['p-l', 'ev-ebit', 'ebit', 'valuation'],
    palavrasChave: ['p/ebit', 'p ebit', 'preço ebit', 'múltiplo'],
  },
  {
    slug: 'psr',
    nome: 'PSR',
    sigla: 'PSR',
    categoria: 'indicador',
    definicaoResumida:
      'PSR (Price to Sales Ratio) relaciona o valor de mercado com a receita. Útil para avaliar empresas que ainda não têm lucro.',
    definicaoCompleta: `O PSR compara quanto o mercado está pagando por cada real de receita da empresa.

**Quando usar:**

• Empresas em crescimento sem lucro (startups, tech)
• Empresas em crise temporária (prejuízo pontual)
• Complemento ao P/L em análises

**Vantagens:**

• Receita é mais difícil de manipular que lucro
• Funciona para empresas sem lucro
• Menos volátil que P/L

**Limitações:**

• Não considera rentabilidade (margem)
• Empresa pode ter receita alta mas prejuízo
• Sozinho não diz se empresa é boa

**Interpretação:**

• PSR < 1: potencialmente barata (mercado paga menos que a receita anual)
• PSR 1-2: razoável
• PSR > 3: cara (comum em tech de alto crescimento)

**Setores com PSR alto:**

• Software/SaaS: 5-15x (margens altas)
• Varejo: 0,3-1x (margens baixas)`,
    formula: 'PSR = Valor de Mercado ÷ Receita Anual',
    exemplo:
      'Empresa vale R$ 10 bilhões e fatura R$ 5 bilhões/ano. PSR = 2. Mercado paga 2x a receita anual.',
    relacionados: ['p-l', 'receita-liquida', 'valuation', 'empresas-crescimento'],
    palavrasChave: ['psr', 'price to sales', 'preço receita', 'p/s'],
  },
  {
    slug: 'divida-liquida-ebitda',
    nome: 'Dívida Líquida/EBITDA',
    sigla: null,
    categoria: 'indicador',
    definicaoResumida:
      'Dívida Líquida/EBITDA indica quantos anos de EBITDA seriam necessários para pagar a dívida líquida. Mede o nível de endividamento da empresa.',
    definicaoCompleta: `Este é um dos indicadores mais importantes para avaliar a saúde financeira de uma empresa.

**Como calcular:**

Dívida Líquida = Dívida Total - Caixa e Equivalentes

Depois divide pelo EBITDA anual.

**Interpretação:**

• < 1x: endividamento muito baixo (conservador)
• 1-2x: endividamento saudável
• 2-3x: endividamento moderado/alto (atenção)
• > 3x: endividamento preocupante (risco)

**Por que é importante:**

Mostra quantos anos a empresa levaria para pagar suas dívidas usando todo o EBITDA.

**Varia por setor:**

• Utilities e infraestrutura: 3-4x é normal (ativos estáveis)
• Varejo e serviços: 1-2x é ideal
• Tech: geralmente < 1x (menos capital intensivo)

**Atenção:**

Em crises, empresas muito endividadas sofrem mais. Dívida Líquida/EBITDA > 4x é sinal de alerta vermelho.`,
    formula: 'Dívida Líquida/EBITDA = (Dívida Total - Caixa) ÷ EBITDA',
    exemplo:
      'Empresa com dívida total de R$ 500 milhões, caixa de R$ 100 milhões e EBITDA de R$ 200 milhões. Dívida Líquida/EBITDA = (500-100)/200 = 2x.',
    atencao:
      'Empresas cíclicas (mineração, siderurgia) devem ter Dívida/EBITDA calculada na alta do ciclo, não na baixa.',
    relacionados: ['ebitda', 'divida-liquida', 'endividamento', 'alavancagem'],
    palavrasChave: ['dívida ebitda', 'endividamento', 'alavancagem financeira', 'solvência'],
  },

  // ========================================
  // AÇÕES E MERCADO
  // ========================================
  {
    slug: 'acoes-on-pn',
    nome: 'Ações ON e PN',
    sigla: null,
    categoria: 'acao',
    definicaoResumida:
      'Ações ON (Ordinárias) dão direito a voto. Ações PN (Preferenciais) têm preferência em dividendos mas geralmente não têm voto. Diferença crucial no mercado brasileiro.',
    definicaoCompleta: `No Brasil, empresas podem emitir dois tipos de ações: Ordinárias (ON) e Preferenciais (PN).

**Ações Ordinárias (ON):**

• Final 3 no ticker (VALE3, PETR3, ITUB3)
• Direito a voto em assembleias
• Elegem conselho de administração
• Tag along de 100% (Novo Mercado) ou 80% (mínimo legal)
• Geralmente menos líquidas que PN

**Ações Preferenciais (PN):**

• Final 4 no ticker (PETR4, ITUB4, BBDC4)
• SEM direito a voto (geralmente)
• Prioridade no recebimento de dividendos
• Podem ter dividendo mínimo garantido
• Geralmente MAIS líquidas e negociadas

**Qual comprar?**

Para investidor pessoa física:
• PN costuma ser melhor (mais líquida, foco em dividendos)
• ON só faz sentido se você quer voto (holdings, grandes investidores)

**Novo Mercado:**

Empresas do Novo Mercado só podem ter ON (acabou com a diferença).

**Preço:**

PN costuma valer menos que ON da mesma empresa (prêmio de controle).`,
    exemplo:
      'PETR3 (ON) vs PETR4 (PN) da Petrobras. PETR4 é mais negociada e preferida por pequenos investidores.',
    relacionados: ['tag-along', 'novo-mercado', 'governanca', 'dividendos'],
    palavrasChave: ['ações on', 'ações pn', 'ordinarias', 'preferenciais', 'ticker'],
  },
  {
    slug: 'free-float',
    nome: 'Free Float',
    sigla: null,
    categoria: 'acao',
    definicaoResumida:
      'Free Float é o percentual de ações em circulação disponível para negociação no mercado. Exclui ações de controladores e investidores estratégicos.',
    definicaoCompleta: `Free Float representa a parcela das ações que está realmente disponível para compra e venda no mercado.

**O que NÃO conta como free float:**

• Ações do controlador
• Ações de investidores estratégicos
• Ações em tesouraria
• Ações bloqueadas (lock-up)

**Por que é importante:**

• Free float alto = maior liquidez
• Free float baixo = mais difícil negociar, maior volatilidade
• Empresas do Novo Mercado precisam mínimo 25% de free float

**Interpretação:**

• Free float < 15%: muito baixo, atenção à liquidez
• Free float 25-40%: razoável
• Free float > 50%: excelente, boa liquidez

**Impacto no preço:**

Ações com baixo free float são mais voláteis porque menos ações disponíveis para absorver compras/vendas.

**Onde consultar:**

Site de RI da empresa, B3, plataformas de análise.`,
    exemplo:
      'Magazine Luiza tem ~70% de free float (muito alto). Já algumas empresas familiares têm < 20% (família controla a maioria).',
    relacionados: ['liquidez', 'volume', 'novo-mercado', 'governanca'],
    palavrasChave: ['free float', 'ações em circulação', 'liquidez', 'float'],
  },
  {
    slug: 'novo-mercado',
    nome: 'Novo Mercado',
    sigla: null,
    categoria: 'acao',
    definicaoResumida:
      'Novo Mercado é o mais alto nível de governança corporativa da B3. Empresas listadas aqui seguem regras rigorosas de transparência e direitos dos minoritários.',
    definicaoCompleta: `O Novo Mercado foi criado pela B3 em 2000 para melhorar a governança das empresas brasileiras.

**Principais regras:**

• Apenas ações ON (ordinárias) - sem PN
• Free float mínimo de 25%
• Tag along de 100% para todos acionistas
• Conselho de administração com mínimo 5 membros, 20% independentes
• Demonstrações financeiras anuais em padrão internacional (IFRS)
• Melhores práticas de disclosure

**Níveis de governança da B3:**

1. **Novo Mercado**: mais rigoroso
2. **Nível 2**: permite PN, mas com boas práticas
3. **Nível 1**: básico
4. **Tradicional**: sem compromisso especial

**Vantagens para investidores:**

• Mais transparência
• Proteção aos minoritários
• Empresas geralmente mais bem geridas
• Maior liquidez

**Exemplos de empresas:**

• Magazine Luiza (MGLU3)
• Localiza (RENT3)
• Weg (WEGE3)
• B3 (B3SA3)`,
    relacionados: ['acoes-on-pn', 'tag-along', 'governanca', 'free-float'],
    palavrasChave: ['novo mercado', 'governança corporativa', 'b3', 'nível governança'],
  },
  {
    slug: 'b3',
    nome: 'B3',
    sigla: 'B3',
    categoria: 'mercado',
    definicaoResumida:
      'B3 (Brasil, Bolsa, Balcão) é a bolsa de valores do Brasil. Único local onde ações, FIIs, ETFs e derivativos são negociados oficialmente no país.',
    definicaoCompleta: `A B3 é a bolsa de valores oficial do Brasil, resultado da fusão entre BM&F e Bovespa em 2017.

**O que é negociado:**

• Ações
• FIIs (Fundos Imobiliários)
• ETFs
• BDRs (recibos de ações estrangeiras)
• Opções e derivativos
• Contratos futuros

**Como funciona:**

• Horário de negociação: 10h às 17h (pregão regular)
• After market: 17h25 às 17h30
• Liquidação: D+2 (dois dias após compra)

**Custos:**

• Taxa de negociação (muito baixa)
• Taxa de custódia (algumas corretoras isentam)
• Corretagem (varia por corretora, muitas são zero)

**Importância:**

É o coração do mercado financeiro brasileiro. Todas as transações de ações passam por ela.

**B3 como empresa:**

A própria B3 é listada na bolsa (ticker B3SA3) e pode ser comprada como investimento.`,
    relacionados: ['ibovespa', 'pregao', 'home-broker', 'corretora'],
    palavrasChave: ['b3', 'bolsa valores', 'bovespa', 'bmf', 'brasil bolsa balcão'],
  },
  {
    slug: 'home-broker',
    nome: 'Home Broker',
    sigla: null,
    categoria: 'mercado',
    definicaoResumida:
      'Home Broker é a plataforma online das corretoras que permite comprar e vender ações, FIIs e outros ativos da bolsa pela internet.',
    definicaoCompleta: `O Home Broker revolucionou o acesso à bolsa, permitindo que qualquer pessoa opere de casa, sem precisar ir fisicamente à bolsa ou ligar para corretor.

**Como funciona:**

1. Você abre conta em uma corretora
2. Transfere dinheiro para a conta
3. Acessa o home broker (web ou app)
4. Coloca ordens de compra/venda
5. Ordens são enviadas para a B3
6. Execução acontece em segundos

**Tipos de ordens:**

• **A mercado**: compra/vende pelo melhor preço disponível agora
• **Limitada**: só executa se atingir o preço que você definiu
• **Stop loss**: venda automática se preço cair abaixo do definido
• **Stop gain**: venda automática se preço subir acima do alvo

**Principais home brokers:**

• Clear (XP)
• Rico
• BTG Pactual Digital
• Inter
• Nu invest

**Recursos comuns:**

• Book de ofertas (ordens de compra/venda)
• Gráficos
• Histórico de operações
• Posição consolidada`,
    relacionados: ['b3', 'corretora', 'ordem-limitada', 'stop-loss'],
    palavrasChave: ['home broker', 'plataforma negociação', 'comprar ações', 'corretora'],
  },

  // ========================================
  // RENDA FIXA COMPLEMENTAR
  // ========================================
  {
    slug: 'tesouro-ipca',
    nome: 'Tesouro IPCA+',
    sigla: null,
    categoria: 'renda-fixa',
    definicaoResumida:
      'Tesouro IPCA+ é um título público que paga IPCA (inflação) mais uma taxa de juros real. Protege seu poder de compra e garante ganho real.',
    definicaoCompleta: `O Tesouro IPCA+ é ideal para objetivos de longo prazo porque garante que você ganhe acima da inflação.

**Como funciona:**

Você compra um título que paga: IPCA + taxa fixa (ex: 6% ao ano)

Se a inflação for 5% no ano, você receberá 11,3% (5% + 6%, composto).

**Tipos:**

• **Tesouro IPCA+ (sem cupom)**: paga tudo no vencimento
• **Tesouro IPCA+ com juros semestrais**: paga cupons a cada 6 meses

**Vantagens:**

• Proteção contra inflação
• Ganho real garantido (acima da inflação)
• Ideal para aposentadoria, educação dos filhos
• Risco soberano (mais seguro do Brasil)

**Vencimentos:**

Existem títulos com vencimento de 5 a 40 anos. Quanto mais longo, geralmente maior a taxa.

**Marcação a mercado:**

Se você vender antes do vencimento, pode ter lucro ou prejuízo dependendo das taxas de juros.`,
    formula: 'Rentabilidade = IPCA do período + Taxa contratada (compostos)',
    exemplo:
      'Você investe R$ 10.000 no Tesouro IPCA+ 2035 que paga IPCA + 6%. Se IPCA for 4% no ano, você recebe ~10,24% no ano (1,04 × 1,06 - 1).',
    atencao:
      'Se você vender antes do vencimento e os juros subiram, o título desvalorizou e você pode ter prejuízo. Só tem garantia se segurar até o fim.',
    relacionados: ['tesouro-direto', 'ipca', 'inflacao', 'renda-fixa'],
    palavrasChave: ['tesouro ipca', 'ntn-b', 'título público', 'proteção inflação'],
  },
  {
    slug: 'tesouro-selic',
    nome: 'Tesouro Selic',
    sigla: null,
    categoria: 'renda-fixa',
    definicaoResumida:
      'Tesouro Selic é um título público pós-fixado que acompanha a taxa Selic. Ideal para reserva de emergência por ter liquidez diária e baixíssimo risco.',
    definicaoCompleta: `O Tesouro Selic (antigo LFT) é considerado o investimento mais seguro e líquido do Brasil.

**Características:**

• Rentabilidade acompanha a Selic
• Liquidez diária (pode resgatar qualquer dia)
• Sem marcação a mercado (não oscila preço)
• Risco soberano (governo federal)

**Por que é ideal para reserva de emergência:**

1. Rende mais que poupança (Selic - 0,20% B3)
2. Pode resgatar quando quiser
3. Não perde valor se Selic sobe/desce
4. Segurança máxima

**Rentabilidade:**

Se Selic está a 13,75% ao ano, Tesouro Selic rende ~13,55% (desconta 0,20% da B3).

Ainda tem IR: 22,5% (até 180 dias) a 15% (acima de 720 dias).

**Liquidez:**

D+0: você vende hoje e o dinheiro cai na conta no mesmo dia (depois vai para conta bancária em D+1).

**Quanto ter:**

6 a 12 meses de despesas na reserva de emergência.`,
    exemplo:
      'Você tem R$ 30.000 em Tesouro Selic. Perdeu o emprego e precisa sacar. No mesmo dia você consegue resgatar sem perda de valor.',
    relacionados: ['tesouro-direto', 'selic', 'reserva-emergencia', 'liquidez'],
    palavrasChave: ['tesouro selic', 'lft', 'reserva emergência', 'liquidez diária'],
  },
  {
    slug: 'cdb',
    nome: 'CDB',
    sigla: 'CDB',
    categoria: 'renda-fixa',
    definicaoResumida:
      'CDB (Certificado de Depósito Bancário) é um título de renda fixa emitido por bancos. Você empresta dinheiro ao banco e recebe juros. Protegido pelo FGC até R$ 250 mil.',
    definicaoCompleta: `CDB é um dos investimentos de renda fixa mais populares no Brasil.

**Como funciona:**

Banco precisa de dinheiro → emite CDB → você compra → banco paga juros → você recebe no vencimento.

**Tipos de CDB:**

• **Pós-fixado:** rende % do CDI (ex: 100% do CDI, 120% do CDI)
• **Prefixado:** taxa fixa definida (ex: 12% ao ano)
• **Híbrido:** IPCA + taxa (ex: IPCA + 6%)

**Proteção FGC:**

Até R$ 250 mil por CPF por instituição. Se o banco quebrar, você recebe até esse limite.

**Liquidez:**

• Alguns têm liquidez diária
• Outros têm carência (90 dias, 1 ano, etc.)
• Verifique antes de investir

**Rentabilidade:**

Bancos menores pagam mais (110-130% CDI) porque precisam atrair dinheiro. Grandes bancos pagam menos (95-100% CDI).

**Tributação:**

IR regressivo: 22,5% (até 180 dias) a 15% (acima de 720 dias).`,
    exemplo:
      'CDB de banco médio pagando 120% do CDI. Se CDI render 10% no ano, você recebe 12% bruto (antes de IR).',
    atencao:
      'Verifique a solidez do banco antes de investir, especialmente acima de R$ 250 mil (limite do FGC).',
    relacionados: ['cdi', 'fgc', 'renda-fixa', 'lci-lca'],
    palavrasChave: ['cdb', 'certificado depósito bancário', 'renda fixa', 'banco'],
  },
  {
    slug: 'lci-lca',
    nome: 'LCI e LCA',
    sigla: 'LCI/LCA',
    categoria: 'renda-fixa',
    definicaoResumida:
      'LCI (Letra de Crédito Imobiliário) e LCA (Letra de Crédito do Agronegócio) são investimentos de renda fixa ISENTOS de IR. Lastreados em créditos imobiliários e do agro.',
    definicaoCompleta: `LCI e LCA são similares ao CDB, mas com a grande vantagem de serem isentos de Imposto de Renda para pessoas físicas.

**Diferenças:**

• **LCI:** lastro em créditos imobiliários (financiamentos de imóveis)
• **LCA:** lastro em créditos do agronegócio

Para o investidor, são praticamente iguais.

**Grande vantagem: ISENÇÃO DE IR!**

• CDB pagando 100% CDI = ~85% CDI líquido (após IR de 15%)
• LCI pagando 85% CDI = 85% CDI líquido (sem IR)

Ou seja, LCI/LCA de 85% equivale a CDB de 100% após impostos.

**Proteção FGC:**

Sim, até R$ 250 mil por CPF por instituição.

**Liquidez:**

Geralmente têm carência de 90 dias (LCI) ou 90 dias (LCA). Algumas têm carência maior.

**Aplicação mínima:**

Costuma ser maior que CDB: R$ 1.000 a R$ 5.000 mínimo.

**Rentabilidade:**

Bancos grandes: 80-90% CDI
Bancos médios: 90-100% CDI`,
    exemplo:
      'LCI pagando 90% do CDI (isenta). Com CDI a 13%, você recebe 11,7% líquido. CDB precisaria pagar 110% do CDI para dar o mesmo após IR.',
    relacionados: ['cdb', 'cdi', 'fgc', 'renda-fixa', 'isencao-ir'],
    palavrasChave: ['lci', 'lca', 'letra crédito', 'isento ir', 'renda fixa'],
  },
  {
    slug: 'cri',
    nome: 'CRI',
    sigla: 'CRI',
    categoria: 'renda-fixa',
    definicaoResumida:
      'CRI (Certificado de Recebíveis Imobiliários) é um título de renda fixa lastreado em dívidas do setor imobiliário. Muito usado por FIIs de papel. Isento de IR.',
    definicaoCompleta: `CRIs são títulos que representam promessas de pagamento futuro de dívidas imobiliárias (financiamentos, aluguéis, etc.).

**Como funciona:**

1. Construtora/incorporadora tem recebíveis futuros (vendas a prazo)
2. Securitizadora empacota esses recebíveis em CRIs
3. CRIs são vendidos a investidores
4. Investidores recebem juros conforme pessoas pagam suas dívidas

**Vantagens:**

• Isenção de IR para pessoa física
• Rentabilidades atrativas (IPCA + 6-8%)
• FIIs de papel investem muito em CRIs

**Riscos:**

• Risco de crédito (inadimplência dos devedores)
• Baixa liquidez (difícil vender antes do vencimento)
• Sem proteção do FGC
• Exige análise de rating

**Onde investir:**

• Diretamente (aplicação mínima alta: R$ 10-50 mil)
• Indiretamente via FIIs de papel (mínimo ~R$ 100)

**Rating:**

CRIs têm classificação de risco (AAA, AA, A, BBB, etc.). Quanto menor o rating, maior o risco e maior o retorno.`,
    exemplo:
      'FII de papel investe em CRI que paga IPCA + 7% ao ano. O FII repassa grande parte disso aos cotistas.',
    atencao:
      'Analise o rating e o emissor. CRIs de baixo rating têm risco real de calote.',
    relacionados: ['fii', 'fundos-papel', 'securitizacao', 'renda-fixa'],
    palavrasChave: ['cri', 'certificado recebíveis imobiliários', 'título imobiliário', 'fii papel'],
  },

  // ========================================
  // ESTRATÉGIAS E CONCEITOS FUNDAMENTAIS
  // ========================================
  {
    slug: 'alocacao-carteira',
    nome: 'Alocação de Carteira',
    sigla: null,
    categoria: 'estrategia',
    definicaoResumida:
      'Alocação de Carteira é a distribuição estratégica de investimentos entre diferentes classes de ativos. Define quanto vai para ações, renda fixa, FIIs, etc.',
    definicaoCompleta: `Alocação é uma das decisões mais importantes em investimentos. Estudos mostram que 90% do resultado vem da alocação, não da escolha de ativos individuais.

**Principais classes:**

• **Renda Fixa:** segurança, liquidez (20-80%)
• **Ações:** crescimento, longo prazo (10-60%)
• **FIIs:** renda passiva (5-30%)
• **Internacional:** diversificação (5-20%)
• **Cripto/Alternativos:** especulação (0-5%)

**Fatores que definem sua alocação:**

• **Idade:** jovens podem ter mais ações
• **Objetivos:** aposentadoria, casa, reserva
• **Prazo:** quanto mais longo, mais renda variável
• **Tolerância a risco:** conservador vs agressivo

**Regra clássica:**

Idade em renda fixa: 30 anos = 30% RF / 70% RV

**Alocação conservadora:**
60% Renda Fixa, 20% Ações, 10% FIIs, 10% Internacional

**Alocação moderada:**
40% Renda Fixa, 40% Ações, 15% FIIs, 5% Internacional

**Alocação agressiva:**
20% Renda Fixa, 60% Ações, 15% FIIs, 5% Internacional`,
    exemplo:
      'Investidor com R$ 100 mil: R$ 40 mil em Tesouro/CDB, R$ 40 mil em ações, R$ 15 mil em FIIs, R$ 5 mil em BDRs (moderada).',
    relacionados: ['diversificacao', 'rebalanceamento', 'risco', 'perfil-investidor'],
    palavrasChave: ['alocação carteira', 'asset allocation', 'distribuição ativos', 'portfólio'],
  },
  {
    slug: 'rebalanceamento',
    nome: 'Rebalanceamento',
    sigla: null,
    categoria: 'estrategia',
    definicaoResumida:
      'Rebalanceamento é ajustar a carteira para voltar à alocação original. Vende o que subiu muito e compra o que caiu, mantendo a estratégia.',
    definicaoCompleta: `Rebalanceamento é a disciplina de manter sua alocação-alvo ao longo do tempo.

**Por que rebalancear:**

Imagine que você definiu 50% Ações / 50% Renda Fixa. Após 1 ano:
• Ações subiram 30% → agora são 57% da carteira
• Renda Fixa rendeu 10% → agora são 43%

Você está mais exposto a risco que planejou. Rebalancear = vender ações, comprar renda fixa, voltar ao 50/50.

**Vantagens:**

• Força você a "vender caro, comprar barato"
• Controla risco
• Disciplina emocional
• Melhora retornos no longo prazo

**Quando rebalancear:**

• **Por tempo:** anualmente, semestralmente
• **Por desvio:** quando alocação sai 5-10% do alvo
• **Por aportes:** novos aportes vão para classe defasada

**Custos:**

• IR (se vender com lucro)
• Corretagem (hoje geralmente zero)
• Considere rebalancear com novos aportes para minimizar custos`,
    exemplo:
      'Carteira com 60% ações subiu muito e virou 70% ações. Rebalancear = vender 10% das ações e comprar renda fixa.',
    atencao:
      'Rebalancear gera fato gerador de IR. Uma estratégia é fazer rebalanceamento via novos aportes (não vende, só compra o defasado).',
    relacionados: ['alocacao-carteira', 'diversificacao', 'buy-and-hold'],
    palavrasChave: ['rebalanceamento', 'rebalancear', 'ajuste carteira', 'manutenção portfólio'],
  },
  {
    slug: 'risco',
    nome: 'Risco',
    sigla: null,
    categoria: 'geral',
    definicaoResumida:
      'Risco em investimentos é a possibilidade de perda ou de não atingir o retorno esperado. Quanto maior o risco, maior deve ser o retorno potencial.',
    definicaoCompleta: `Risco é inerente a qualquer investimento. Não existe retorno sem risco - a questão é quanto risco você aceita.

**Principais tipos de risco:**

• **Risco de mercado:** preços sobem e descem
• **Risco de liquidez:** dificuldade de vender
• **Risco de crédito:** emissor não paga (calote)
• **Risco de inflação:** poder de compra reduz
• **Risco cambial:** moeda estrangeira oscila
• **Risco de concentração:** tudo em um ativo

**Relação risco-retorno:**

Princípio básico: maior risco exige maior retorno esperado.
• Tesouro Selic: baixo risco, retorno Selic
• Ações: alto risco, retorno potencial alto
• Cripto: altíssimo risco, retorno potencial altíssimo (ou perda total)

**Como gerenciar risco:**

• **Diversificação:** não colocar ovos em uma cesta
• **Alocação adequada:** conforme seu perfil
• **Horizonte longo:** reduz risco de ações
• **Stop loss:** limita perdas
• **Estudo:** conhecimento reduz risco

**Perfis de risco:**

• Conservador: prefere segurança, aceita menos retorno
• Moderado: balanço risco/retorno
• Agressivo: aceita perdas por retornos maiores`,
    atencao:
      'Nunca invista em algo que você não entende. Isso é risco desnecessário.',
    relacionados: ['volatilidade', 'diversificacao', 'beta', 'perfil-investidor'],
    palavrasChave: ['risco', 'risco investimento', 'gerenciamento risco', 'perdas'],
  },
  {
    slug: 'beta',
    nome: 'Beta',
    sigla: null,
    categoria: 'indicador',
    definicaoResumida:
      'Beta mede a volatilidade de uma ação em relação ao mercado (Ibovespa). Beta > 1 = mais volátil. Beta < 1 = menos volátil.',
    definicaoCompleta: `Beta é um indicador estatístico que mostra se uma ação se move mais ou menos que o mercado.

**Como interpretar:**

• **Beta = 1:** ação acompanha o Ibovespa (se Ibov sobe 10%, ação sobe ~10%)
• **Beta > 1:** ação mais volátil (Beta 1,5 = sobe/desce 50% mais que Ibov)
• **Beta < 1:** ação menos volátil (Beta 0,5 = sobe/desce metade do Ibov)
• **Beta negativo:** ação se move inversamente ao mercado (raro)

**Setores com Beta alto:**

• Pequenas empresas (small caps)
• Tecnologia
• Varejo
• Construtoras

**Setores com Beta baixo:**

• Utilities (energia elétrica, saneamento)
• Alimentos
• Bancos grandes

**Para que serve:**

• Avaliar risco da ação
• Montar carteira balanceada
• Calcular retorno esperado (CAPM)

**Limitações:**

• Beta histórico não garante beta futuro
• Baseado em dados passados (2-5 anos)
• Não capta todo tipo de risco`,
    exemplo:
      'PETR4 tem Beta ~1,2. Se Ibovespa sobe 10%, PETR4 tende a subir 12%. Se Ibov cai 10%, PETR4 cai ~12%.',
    relacionados: ['volatilidade', 'risco', 'ibovespa', 'capm'],
    palavrasChave: ['beta', 'volatilidade ação', 'risco sistemático', 'correlação mercado'],
  },
  {
    slug: 'alavancagem',
    nome: 'Alavancagem',
    sigla: null,
    categoria: 'estrategia',
    definicaoResumida:
      'Alavancagem é usar dinheiro emprestado para investir. Amplifica ganhos E perdas. Estratégia de alto risco usada por traders e investidores sofisticados.',
    definicaoCompleta: `Alavancagem é operar com mais dinheiro do que você tem, usando crédito da corretora ou derivativos.

**Como funciona:**

Você tem R$ 10 mil, corretora empresta R$ 40 mil = R$ 50 mil para operar.
• Se ganhar 10%: lucro de R$ 5 mil sobre R$ 50 mil = 50% sobre seu capital
• Se perder 10%: prejuízo de R$ 5 mil = -50% do seu capital

**Tipos de alavancagem:**

• **Margem de garantia:** corretora empresta dinheiro
• **Mercado futuro:** contratos futuros (alta alavancagem)
• **Opções:** prêmios pequenos controlam posições grandes
• **COE e derivativos**

**Riscos enormes:**

• Perdas podem exceder capital inicial
• Chamada de margem (margin call) - obriga vender na perda
• Juros sobre valor emprestado
• Stress emocional alto

**Quando usar:**

• Traders profissionais experientes
• Estratégias de hedge
• Nunca para iniciantes

**Alavancagem em empresas:**

Empresas também se alavancam com dívida. ROE sobe, mas risco também.`,
    exemplo:
      'Trader com R$ 10 mil alavanca 5x = R$ 50 mil. Ação cai 15%. Perde R$ 7,5 mil (mais que tinha!). Margin call força venda.',
    atencao:
      'Alavancagem é uma das principais causas de falências de traders. 95% dos iniciantes que alavancam perdem dinheiro. NÃO faça sem estudo profundo.',
    relacionados: ['day-trade', 'margin-call', 'derivativos', 'risco'],
    palavrasChave: ['alavancagem', 'leverage', 'margem', 'operar alavancado'],
  },
  {
    slug: 'hedge',
    nome: 'Hedge',
    sigla: null,
    categoria: 'estrategia',
    definicaoResumida:
      'Hedge é uma proteção contra riscos. Operação que busca neutralizar perdas potenciais em outra posição. Como um seguro para investimentos.',
    definicaoCompleta: `Hedge (proteção) é fazer uma operação que compensa perdas de outra. É como um seguro.

**Exemplos práticos:**

**1. Exportador:**
Vai receber US$ 1 milhão em 6 meses. Risco: dólar cair.
Hedge: vende dólar futuro hoje. Se dólar cair, perde no recebimento mas ganha no futuro.

**2. Investidor de ações:**
Tem R$ 100 mil em ações. Teme queda.
Hedge: compra opção de venda (put). Se ações caem, put sobe, compensa parte.

**3. FII com CDI:**
FII investe em CRIs de taxa fixa. Risco: juros subirem, CRIs desvalorizarem.
Hedge: posição em Tesouro Selic (se Selic sobe, Tesouro compensa).

**Instrumentos de hedge:**

• Mercado futuro
• Opções
• Swap
• Ativos descorrelacionados

**Custo:**

Hedge tem custo (prêmio, spread). É como pagar seguro. Reduz retorno potencial mas também reduz risco.

**Para quem:**

• Empresas (hedge cambial, commodities)
• Investidores institucionais
• Pessoas físicas sofisticadas`,
    exemplo:
      'Você tem ações de PETR4. Compra opção PUT (venda). Se PETR4 cair muito, a PUT valoriza e compensa parte da perda.',
    relacionados: ['opcoes', 'derivativos', 'risco', 'protecao'],
    palavrasChave: ['hedge', 'proteção', 'seguro investimento', 'neutralizar risco'],
  },

  // ========================================
  // ANÁLISE TÉCNICA E FUNDAMENTALISTA
  // ========================================
  {
    slug: 'analise-tecnica',
    nome: 'Análise Técnica',
    sigla: null,
    categoria: 'estrategia',
    definicaoResumida:
      'Análise Técnica estuda gráficos de preços e volume para prever movimentos futuros. Usada principalmente por traders de curto e médio prazo.',
    definicaoCompleta: `Análise Técnica se baseia em padrões gráficos, indicadores matemáticos e volume para tentar prever para onde o preço vai.

**Premissas:**

• Tudo está no preço (já reflete todas as informações)
• História se repete (padrões se repetem)
• Preço se move em tendências

**Ferramentas principais:**

**Gráficos:**
• Candlestick (velas japonesas)
• Gráfico de linhas
• Gráfico de barras

**Indicadores:**
• Médias móveis (MA, EMA)
• RSI (força relativa)
• MACD
• Bandas de Bollinger
• Volume

**Conceitos:**
• Suporte e resistência
• Tendências (alta, baixa, lateral)
• Padrões (ombro-cabeça-ombro, topos duplos, etc.)

**Quando usar:**

• Day trade e swing trade
• Definir pontos de entrada/saída
• Complementar análise fundamentalista
• Trade de curto prazo

**Críticas:**

• Não considera fundamentos da empresa
• Sinais falsos são comuns
• Funcionalidade questionada por academia`,
    relacionados: ['analise-fundamentalista', 'candlestick', 'suporte-resistencia', 'day-trade'],
    palavrasChave: ['análise técnica', 'grafista', 'chart', 'indicadores técnicos'],
  },
  {
    slug: 'analise-fundamentalista',
    nome: 'Análise Fundamentalista',
    sigla: null,
    categoria: 'estrategia',
    definicaoResumida:
      'Análise Fundamentalista avalia o valor intrínseco de uma empresa através de indicadores financeiros, mercado, gestão e perspectivas. Base do buy and hold.',
    definicaoCompleta: `Análise Fundamentalista busca determinar o "valor justo" de uma empresa para saber se a ação está cara ou barata.

**O que analisa:**

**Indicadores Financeiros:**
• P/L, P/VP, P/EBITDA
• ROE, ROIC, ROA
• Margem Líquida, Margem EBITDA
• Dívida Líquida/EBITDA
• Crescimento de receita e lucro

**Qualitativo:**
• Qualidade da gestão
• Vantagens competitivas (moat)
• Governança corporativa
• Setor de atuação
• Modelo de negócio

**Macroeconômico:**
• Ciclo econômico
• Taxa de juros
• Câmbio
• Regulações

**Objetivo:**

Encontrar empresas de qualidade negociadas abaixo do valor justo (margin of safety).

**Quando usar:**

• Investimento de longo prazo (buy and hold)
• Construção de carteira de ações
• Análise de dividendos

**Grandes praticantes:**

Warren Buffett, Benjamin Graham, Luiz Barsi (Brasil).`,
    relacionados: ['buy-and-hold', 'valuation', 'roe', 'p-l', 'analise-tecnica'],
    palavrasChave: ['análise fundamentalista', 'valuation', 'valor intrínseco', 'fundamentos'],
  },

  // ========================================
  // TERMOS COMPLEMENTARES
  // ========================================
  {
    slug: 'lucro-liquido',
    nome: 'Lucro Líquido',
    sigla: null,
    categoria: 'indicador',
    definicaoResumida:
      'Lucro Líquido é o resultado final da empresa após deduzir todos os custos, despesas, juros e impostos. É o que sobra para os acionistas.',
    definicaoCompleta: `O Lucro Líquido é a "linha de baixo" do DRE (Demonstração do Resultado do Exercício). É o lucro "de verdade".

**Como chega no lucro líquido:**

1. Receita Bruta
2. (-) Impostos sobre venda
3. = Receita Líquida
4. (-) Custos dos produtos (CPV)
5. = Lucro Bruto
6. (-) Despesas operacionais
7. = EBIT (Lucro Operacional)
8. (-) Despesas financeiras (juros)
9. = Lucro Antes dos Impostos
10. (-) IR e CSLL
11. = **Lucro Líquido**

**Para que serve:**

• Base para calcular LPA (Lucro por Ação)
• Base para P/L
• Define dividendos (vem do lucro líquido)
• Mostra rentabilidade final para acionista

**Atenção:**

Lucro contábil nem sempre é caixa. Pode ter lucro mas não ter dinheiro (vendas a prazo, por exemplo).`,
    formula: 'Lucro Líquido = Receita - Todos os Custos e Despesas - Impostos',
    relacionados: ['lpa', 'p-l', 'margem-liquida', 'dividendos', 'roe'],
    palavrasChave: ['lucro líquido', 'bottom line', 'lucro final', 'resultado'],
  },
  {
    slug: 'patrimonio-liquido',
    nome: 'Patrimônio Líquido',
    sigla: 'PL',
    categoria: 'indicador',
    definicaoResumida:
      'Patrimônio Líquido é o valor contábil da empresa que pertence aos acionistas. Ativos menos Passivos. Também chamado de capital próprio.',
    definicaoCompleta: `O Patrimônio Líquido representa o que "sobra" da empresa para os donos após pagar todas as dívidas.

**Fórmula básica:**

PL = Ativo Total - Passivo Total

Ou seja: tudo que a empresa tem menos tudo que ela deve = patrimônio dos acionistas.

**Componentes:**

• Capital social (investimento inicial dos sócios)
• Reservas de lucros (lucros acumulados não distribuídos)
• Ações em tesouraria
• Ajustes de avaliação

**Para que serve:**

• Base para calcular ROE (Retorno sobre PL)
• Base para VPA (Valor Patrimonial por Ação)
• Base para P/VP
• Indica "tamanho" do patrimônio dos acionistas

**PL negativo:**

Indica que empresa tem mais dívidas que ativos. Sinal de alerta vermelho (prejuízos acumulados).

**PL crescente:**

PL aumenta quando empresa lucra e retém lucros. É bom sinal de acumulação de valor.`,
    formula: 'Patrimônio Líquido = Ativo Total - Passivo Total',
    relacionados: ['roe', 'vpa', 'p-vp', 'balanço-patrimonial'],
    palavrasChave: ['patrimônio líquido', 'pl', 'capital próprio', 'equity'],
  },
  {
    slug: 'bonificacao',
    nome: 'Bonificação',
    sigla: null,
    categoria: 'geral',
    definicaoResumida:
      'Bonificação é a distribuição gratuita de novas ações aos acionistas, proporcional à quantidade que possuem. Empresa usa reservas de lucros para aumentar capital.',
    definicaoCompleta: `Bonificação é quando a empresa te dá ações de "graça". Mas você não fica mais rico - é um ajuste contábil.

**Como funciona:**

Empresa decide incorporar reservas ao capital social, emitindo novas ações.

Exemplo: bonificação de 10%
• Você tinha 100 ações
• Recebe 10 ações novas (bonificação)
• Agora tem 110 ações

**MAS o preço cai proporcionalmente:**

• Antes: 100 ações a R$ 50 = R$ 5.000
• Bonificação 10%: 110 ações a R$ 45,45 = R$ 5.000

Seu patrimônio continua o mesmo!

**Por que empresas fazem:**

• Ajuste contábil
• Aumentar liquidez (mais ações no mercado)
• "Psicológico" (investidores gostam de receber ações)

**Tributação:**

Bonificação NÃO tem IR na hora. Só pagará IR quando vender as ações (sobre o ganho de capital).

**Diferença de desdobramento:**

São parecidos no efeito (mais ações, preço menor), mas origem contábil diferente.`,
    exemplo:
      'Empresa anuncia bonificação de 20%. Você tinha 50 ações a R$ 40 (R$ 2.000). Recebe 10 ações novas. Fica com 60 ações a R$ 33,33 (R$ 2.000).',
    relacionados: ['desdobramento', 'dividendos', 'proventos'],
    palavrasChave: ['bonificação', 'bonification', 'ações grátis', 'provento'],
  },
  {
    slug: 'desdobramento',
    nome: 'Desdobramento',
    sigla: 'Split',
    categoria: 'acao',
    definicaoResumida:
      'Desdobramento (split) divide cada ação em múltiplas ações, reduzindo o preço proporcionalmente. 1 ação vira 2, 3 ou mais. Não muda valor total.',
    definicaoCompleta: `Desdobramento (stock split) é quando a empresa divide cada ação existente em várias ações menores.

**Como funciona:**

Desdobramento 1:2 (cada ação vira 2):
• Você tinha 100 ações a R$ 100 = R$ 10.000
• Desdobra 1:2
• Agora tem 200 ações a R$ 50 = R$ 10.000

**Objetivo:**

• Reduzir preço da ação (tornar mais acessível)
• Aumentar liquidez
• "Psicológico" - preço menor atrai mais investidores

**Exemplo real:**

Apple já fez vários splits. Em 2020 fez 4:1 (cada ação virou 4).

**No Brasil:**

Menos comum que nos EUA, mas acontece. Magazine Luiza já fez, várias empresas de tech fazem.

**Impacto:**

• Zero impacto no valor da empresa
• Zero impacto no seu patrimônio
• Pode aumentar liquidez
• Ações no lote padrão (100) ficam mais acessíveis

**Oposto: Grupamento:**

Junta várias ações em uma (inplit). Usado quando ação está muito barata (< R$ 1).`,
    exemplo:
      'MGLU3 a R$ 20. Faz split 2:1. Vira R$ 10, mas você tem o dobro de ações. Valor total igual.',
    relacionados: ['grupamento', 'bonificacao', 'lote-padrao'],
    palavrasChave: ['desdobramento', 'split', 'divisão ações', 'stock split'],
  },
  {
    slug: 'grupamento',
    nome: 'Grupamento',
    sigla: 'Inplit',
    categoria: 'acao',
    definicaoResumida:
      'Grupamento (inplit ou reverse split) junta várias ações em uma só, aumentando o preço proporcionalmente. Oposto do desdobramento. Usado quando ação está muito barata.',
    definicaoCompleta: `Grupamento é o inverso do desdobramento. Várias ações viram uma, preço aumenta proporcionalmente.

**Como funciona:**

Grupamento 10:1 (cada 10 ações viram 1):
• Você tinha 1.000 ações a R$ 1 = R$ 1.000
• Grupamento 10:1
• Agora tem 100 ações a R$ 10 = R$ 1.000

**Por que empresas fazem:**

• Ação muito barata (< R$ 1) passa impressão ruim
• Evitar "penny stocks"
• Cumprir requisitos de bolsa
• Reduzir volatilidade percentual

**Sinais:**

Grupamento geralmente é sinal de que ação caiu muito. Empresa em dificuldades.

**No Brasil:**

CVC já fez, Oi fez várias vezes, outras empresas em crise.

**Cuidado:**

Grupamento não resolve problemas da empresa. É cosmético. Se fundamentos são ruins, ação pode voltar a cair.

**Seu patrimônio:**

Não muda na hora do grupamento. Mas se empresa está fazendo grupamento, geralmente está mal.`,
    exemplo:
      'Ação a R$ 0,50. Faz grupamento 5:1. Vira R$ 2,50, mas você tem 5x menos ações. Valor total igual.',
    atencao:
      'Grupamentos frequentes são bandeira vermelha. Indica empresa em espiral de queda.',
    relacionados: ['desdobramento', 'penny-stocks', 'crise-empresa'],
    palavrasChave: ['grupamento', 'inplit', 'reverse split', 'junção ações'],
  },
  {
    slug: 'corretora',
    nome: 'Corretora de Valores',
    sigla: null,
    categoria: 'mercado',
    definicaoResumida:
      'Corretora é a instituição que intermedeia compra e venda de ativos na bolsa. Obrigatória para investir em ações, FIIs, etc. Regulada pela CVM.',
    definicaoCompleta: `Corretora de Valores é a porta de entrada para investir na bolsa. Você não pode comprar ações diretamente - precisa de uma corretora.

**O que corretora faz:**

• Intermedeia ordens de compra/venda na B3
• Custodia seus ativos
• Oferece home broker
• Presta relatórios e informes de rendimentos
• Algumas oferecem assessoria

**Principais no Brasil:**

• XP Investimentos (Clear)
• BTG Pactual Digital
• Inter
• Rico
• Nu Invest (Nubank)
• Banco do Brasil, Itaú, Bradesco (grandes bancos)

**Como escolher:**

• Taxa de corretagem (muitas são zero hoje)
• Taxa de custódia
• Qualidade do home broker/app
• Produtos disponíveis
• Atendimento
• Reputação

**Custos comuns:**

• Corretagem: R$ 0-20 por ordem (muitas R$ 0)
• Custódia: R$ 0-10/mês (muitas isentam)
• Taxas de B3 (mínimas)

**Segurança:**

Corretoras não podem "sumir" com seu dinheiro. Ativos ficam em custódia na B3 em seu nome.`,
    relacionados: ['b3', 'home-broker', 'custodia', 'cvm'],
    palavrasChave: ['corretora', 'corretora valores', 'intermediária', 'broker'],
  },
  {
    slug: 'cvm',
    nome: 'CVM',
    sigla: 'CVM',
    categoria: 'mercado',
    definicaoResumida:
      'CVM (Comissão de Valores Mobiliários) é o órgão fiscalizador do mercado de capitais brasileiro. Regula bolsa, corretoras, empresas listadas e fundos.',
    definicaoCompleta: `A CVM é como o "xerife" do mercado de capitais. Protege investidores e garante funcionamento correto do mercado.

**Responsabilidades:**

• Fiscalizar bolsas de valores (B3)
• Regulamentar corretoras
• Aprovar ofertas públicas (IPOs)
• Punir irregularidades (insider trading, manipulação)
• Regulamentar fundos de investimento
• Exigir transparência de empresas listadas

**Poderes:**

• Multar empresas e pessoas
• Suspender negociações de ativos
• Proibir administradores de atuar
• Investigar fraudes

**Para investidores:**

• Site da CVM tem dados de todas empresas abertas
• Pode denunciar irregularidades
• Consultar se corretora/assessor é regularizado
• Informações públicas sobre empresas

**Histórico:**

Criada em 1976 para desenvolver e fiscalizar o mercado de capitais brasileiro.

**Comparação:**

CVM do Brasil = SEC dos Estados Unidos`,
    relacionados: ['b3', 'corretora', 'ipo', 'regulacao'],
    palavrasChave: ['cvm', 'comissão valores mobiliários', 'fiscalização', 'regulador'],
  },
  {
    slug: 'ipca',
    nome: 'IPCA',
    sigla: 'IPCA',
    categoria: 'mercado',
    definicaoResumida:
      'IPCA (Índice Nacional de Preços ao Consumidor Amplo) é o índice oficial de inflação do Brasil. Mede variação de preços de uma cesta de produtos e serviços.',
    definicaoCompleta: `O IPCA é o termômetro da inflação brasileira, calculado mensalmente pelo IBGE.

**O que mede:**

Variação de preços de uma cesta com:
• Alimentação e bebidas
• Habitação (aluguel, energia)
• Transporte
• Saúde e cuidados pessoais
• Vestuário
• Educação
• Comunicação

**Por que é importante:**

• Meta de inflação do Banco Central (3,0% em 2024)
• Base para Tesouro IPCA+
• Correção de aluguéis e contratos
• Reajuste de salários
• Referência para investimentos

**Como afeta investimentos:**

• Investidor busca ganhar acima do IPCA (ganho real)
• Tesouro IPCA+ protege contra inflação
• Poupança rende Selic, mas é comparada com IPCA
• FIIs têm contratos corrigidos por IPCA

**Meta de inflação:**

BC sobe Selic quando IPCA fica acima da meta (4,5% em 2024). Desce Selic quando IPCA está sob controle.

**Onde consultar:**

Site do IBGE, divulgado mensalmente (geralmente 2ª semana do mês).`,
    exemplo:
      'IPCA de 2023 foi ~4,6%. Investimento precisa render > 4,6% para ter ganho real.',
    relacionados: ['inflacao', 'tesouro-ipca', 'selic', 'poder-compra'],
    palavrasChave: ['ipca', 'inflação', 'índice preços', 'ibge'],
  },
  {
    slug: 'inflacao',
    nome: 'Inflação',
    sigla: null,
    categoria: 'geral',
    definicaoResumida:
      'Inflação é o aumento generalizado e contínuo de preços. Reduz o poder de compra do dinheiro. Principal inimigo do investidor de longo prazo.',
    definicaoCompleta: `Inflação é quando os preços sobem e o dinheiro perde valor. R$ 100 hoje compram menos que R$ 100 há 10 anos.

**Causas:**

• Demanda maior que oferta (economia aquecida)
• Aumento de custos (petróleo, salários)
• Emissão excessiva de moeda pelo governo
• Expectativas (se todos esperam inflação, ela acontece)

**Impactos:**

• Poder de compra diminui
• Poupança desvaloriza
• Contratos reajustados
• Juros sobem (Selic)

**Como se proteger:**

• Investir em ativos reais (imóveis, ações)
• Tesouro IPCA+
• FIIs (aluguéis corrigidos pela inflação)
• Ações de qualidade (empresas repassam custos)

**Inflação no Brasil:**

• Anos 80-90: hiperinflação (1000%+ ao ano)
• Plano Real (1994): estabilização
• Meta: 3% ao ano (2024)
• Média 2010-2020: ~6% ao ano

**Deflação:**

Oposto (preços caem). Parece bom, mas pode indicar economia em crise.`,
    relacionados: ['ipca', 'tesouro-ipca', 'selic', 'poder-compra'],
    palavrasChave: ['inflação', 'alta preços', 'desvalorização moeda', 'ipca'],
  },
  {
    slug: 'custodia',
    nome: 'Custódia',
    sigla: null,
    categoria: 'mercado',
    definicaoResumida:
      'Custódia é o serviço de guarda e administração dos seus ativos. Na bolsa, quem faz custódia é a B3, não a corretora. Seus ativos estão em seu nome no CPF.',
    definicaoCompleta: `Custódia é onde seus investimentos ficam "guardados" de forma segura e registrada.

**Como funciona na bolsa:**

• Você compra ações via corretora XYZ
• Ações ficam custodiadas na B3
• Registradas em SEU CPF
• Corretora é apenas intermediária

**Segurança:**

Se corretora quebrar, seus ativos continuam seus. Estão na B3, não na corretora.

**Onde consultar:**

• Canal Eletrônico do Investidor (CEI) - site da B3
• Mostra TODOS seus ativos em TODAS corretoras
• Histórico de movimentações
• Proventos recebidos

**Taxa de custódia:**

• B3 cobra taxa mínima
• Algumas corretoras repassam (R$ 0-10/mês)
• Muitas corretoras isentam

**Outros tipos de custódia:**

• Renda fixa: pode ser na corretora ou na B3 (dependendo do tipo)
• Fundos: na gestora
• Tesouro Direto: no Tesouro Nacional

**Transferência:**

Pode transferir ativos de uma corretora para outra sem vender (DTC - Direct Transfer of Custody).`,
    relacionados: ['b3', 'cei', 'corretora', 'seguranca'],
    palavrasChave: ['custódia', 'guarda ativos', 'cei', 'registro ações'],
  },
  {
    slug: 'copom',
    nome: 'COPOM',
    sigla: 'COPOM',
    categoria: 'mercado',
    definicaoResumida:
      'COPOM (Comitê de Política Monetária) é o grupo do Banco Central que define a Taxa Selic. Reúne-se a cada 45 dias para decidir os juros do país.',
    definicaoCompleta: `O COPOM é o "comitê dos juros" do Brasil. Decisão mais esperada e impactante para o mercado financeiro.

**Composição:**

• Presidente do Banco Central + 8 diretores
• Total: 9 membros votantes

**O que faz:**

• Define meta da Taxa Selic
• Analisa inflação, crescimento, câmbio
• Publica ata explicando decisão
• Define direcionamento futuro (forward guidance)

**Calendário:**

• 8 reuniões por ano (a cada ~45 dias)
• Datas pré-definidas
• Decisão anunciada às 18h30
• Ata publicada 6 dias depois

**Como impacta você:**

• Selic sobe → renda fixa rende mais, ações caem
• Selic cai → renda fixa rende menos, ações sobem
• Afeta financiamentos, cartões, todo crédito

**Expectativa do mercado:**

Antes da reunião, mercado "precifica" expectativa. Se COPOM surpreende (corta/sobe mais que esperado), mercado reage forte.

**Acompanhar:**

Site do BC, comunicados oficiais, análises de economistas.`,
    relacionados: ['selic', 'banco-central', 'inflacao', 'politica-monetaria'],
    palavrasChave: ['copom', 'comitê política monetária', 'reunião copom', 'banco central'],
  },
  {
    slug: 'proventos',
    nome: 'Proventos',
    sigla: null,
    categoria: 'geral',
    definicaoResumida:
      'Proventos são todas as formas de remuneração que acionistas recebem das empresas. Incluem dividendos, JCP, bonificações e direitos de subscrição.',
    definicaoCompleta: `Proventos é o termo guarda-chuva para tudo que empresa distribui aos acionistas.

**Tipos de proventos:**

**1. Dividendos:**
• Distribuição de lucros em dinheiro
• Isentos de IR para pessoa física

**2. JCP (Juros sobre Capital Próprio):**
• Similar a dividendos, mas com IR de 15%
• Vantagem fiscal para empresa

**3. Bonificação:**
• Distribuição de ações gratuitas
• Aumento de capital com reservas

**4. Direito de Subscrição:**
• Direito de comprar novas ações
• Preço geralmente com desconto
• Pode vender o direito se não quiser subscrever

**Calendário:**

• Data COM: último dia para comprar e ter direito
• Data EX: primeiro dia sem direito
• Data de pagamento: quando cai na conta

**Reinvestimento:**

Muitos investidores reinvestem proventos, acelerando efeito dos juros compostos.

**FIIs:**

Obrigados a distribuir 95% dos lucros semestralmente. Geralmente pagam mensalmente.`,
    relacionados: ['dividendos', 'jscp', 'bonificacao', 'subscricao'],
    palavrasChave: ['proventos', 'distribuição', 'remuneração acionista', 'rendimentos'],
  },
]

export function encontrarTermo(slug: string): TermoGlossario | undefined {
  return termos.find((t) => t.slug === slug)
}

export function encontrarTermosPorCategoria(
  categoria: string
): TermoGlossario[] {
  return termos.filter((t) => t.categoria === categoria)
}

export function buscarTermos(query: string): TermoGlossario[] {
  const q = query.toLowerCase()
  return termos.filter(
    (t) =>
      t.nome.toLowerCase().includes(q) ||
      t.slug.includes(q) ||
      t.palavrasChave.some((p) => p.includes(q)) ||
      (t.sigla && t.sigla.toLowerCase().includes(q))
  )
}

export const categorias = [
  {
    key: 'indicador',
    label: 'Indicadores Financeiros',
    icon: 'i-lucide-chart-line',
    descricao: 'Métricas para avaliar empresas e ativos',
  },
  {
    key: 'acao',
    label: 'Ações e Bolsa',
    icon: 'i-lucide-trending-up',
    descricao: 'Termos sobre ações e mercado de capitais',
  },
  {
    key: 'fii',
    label: 'Fundos Imobiliários',
    icon: 'i-lucide-building-2',
    descricao: 'Conceitos específicos de FIIs',
  },
  {
    key: 'renda-fixa',
    label: 'Renda Fixa',
    icon: 'i-lucide-piggy-bank',
    descricao: 'Títulos e investimentos de renda fixa',
  },
  {
    key: 'mercado',
    label: 'Mercado',
    icon: 'i-lucide-bar-chart-3',
    descricao: 'Índices, bolsas e conceitos de mercado',
  },
  {
    key: 'estrategia',
    label: 'Estratégias',
    icon: 'i-lucide-target',
    descricao: 'Estratégias e métodos de investimento',
  },
  {
    key: 'geral',
    label: 'Conceitos Gerais',
    icon: 'i-lucide-book-open',
    descricao: 'Termos fundamentais de finanças',
  },
]

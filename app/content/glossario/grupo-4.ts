import type { GlossaryTerm } from '~/types/glossario'

/** Grupo 4 do glossário (preenchido por port agent). Ver grupo-1 (exemplar). */
export const GRUPO_4: GlossaryTerm[] = [
  {
    slug: 'alocacao-carteira',
    term: 'Alocação de Carteira',
    letter: 'A',
    short:
      'Alocação de carteira (asset allocation) é a decisão de quanto do patrimônio vai para cada classe de ativo (renda fixa, ações, FIIs, exterior), a escolha estrutural que mais define o comportamento da carteira.',
    body: [
      'A <strong>alocação de carteira</strong>, também chamada de <strong>asset allocation</strong>, é a decisão de quanto do seu patrimônio vai para cada classe de ativo: renda fixa, ações, <a href="/glossario/fii">fundos imobiliários</a>, investimentos no exterior e por aí. É a escolha estrutural da carteira, aquela que define o comportamento do conjunto muito mais do que a escolha de um papel específico.',
      'Na prática, a alocação traduz o seu perfil e o seu horizonte em percentuais. Quanto mais longo o prazo e maior a tolerância a <a href="/glossario/risco">risco</a>, mais espaço para a renda variável; quanto mais curto o objetivo, mais peso na renda fixa. Uma referência clássica é manter em renda fixa uma fatia próxima da sua idade, ajustando conforme metas, reserva de emergência e apetite por oscilação.',
      '<strong>Exemplo ilustrativo:</strong> uma carteira de perfil moderado poderia dividir 40% em renda fixa, 40% em ações, 15% em fundos imobiliários e 5% no exterior. São percentuais redondos só para mostrar a lógica, não uma recomendação: a divisão certa depende inteiramente do seu caso.',
      'A alocação não é estática. Com o tempo, os ativos que sobem passam a pesar mais do que o planejado, e é aí que entra o <a href="/glossario/rebalanceamento">rebalanceamento</a>. Combinar uma boa alocação com <a href="/glossario/diversificacao">diversificação</a> dentro de cada classe é o que costuma sustentar uma carteira ao longo dos ciclos de mercado.',
    ],
    related: ['diversificacao', 'rebalanceamento', 'risco', 'beta'],
    backlink: {
      label: 'Explorar ações, FIIs e renda fixa pra montar sua alocação',
      to: '/rankings',
    },
    faq: [
      {
        q: 'Qual a melhor alocação de carteira?',
        a: 'Não existe uma alocação única melhor para todo mundo. A divisão ideal depende do seu horizonte de tempo, dos seus objetivos e da sua tolerância a risco. Quem poupa para a aposentadoria em vinte anos costuma tolerar mais renda variável do que quem vai usar o dinheiro em dois anos.',
      },
      {
        q: 'Alocação de carteira é mais importante que escolher ações?',
        a: 'Para a maioria dos investidores de longo prazo, a decisão de quanto colocar em cada classe de ativo tende a explicar boa parte da variação de resultado ao longo do tempo, mais do que a escolha de um papel isolado. Por isso vale definir a alocação antes de sair comprando ativos.',
      },
      {
        q: 'Com que frequência devo revisar a alocação?',
        a: 'Não há regra fixa. Muitos investidores revisam uma ou duas vezes por ano, ou quando alguma classe se afasta bastante do alvo, e ajustam preferencialmente pelos novos aportes para reduzir custos e imposto.',
      },
    ],
  },
  {
    slug: 'rebalanceamento',
    term: 'Rebalanceamento',
    letter: 'R',
    short:
      'Rebalanceamento é o ajuste periódico da carteira de volta à alocação-alvo, reduzindo o que subiu demais e reforçando o que ficou defasado, para manter o nível de risco planejado.',
    body: [
      'O <strong>rebalanceamento</strong> é a disciplina de trazer a carteira de volta à <a href="/glossario/alocacao-carteira">alocação</a> que você definiu. Com o tempo, as classes que sobem passam a pesar mais do que o planejado, e a carteira vai ficando mais arriscada (ou mais conservadora) do que você queria. Rebalancear é corrigir esse desvio.',
      'A mecânica força um comportamento saudável: você reduz o que se valorizou muito e reforça o que ficou para trás, ou seja, vende relativamente caro e compra relativamente barato, sem depender de palpite. É uma ferramenta de controle de <a href="/glossario/risco">risco</a> e de disciplina emocional, não de previsão de mercado.',
      '<strong>Exemplo ilustrativo:</strong> uma carteira montada em 50% ações e 50% renda fixa, depois de um ano de alta das ações, pode chegar a 57% em ações. Rebalancear é vender parte das ações e reforçar a renda fixa até voltar aos 50/50. Os números são redondos apenas para ilustrar a ideia.',
      'Há três gatilhos comuns: por tempo (a cada semestre ou ano), por desvio (quando uma classe sai alguns pontos percentuais do alvo) ou por aporte. Esta última costuma ser a mais eficiente: direcionar os novos aportes para a classe defasada evita vender com lucro e, com isso, adiar o imposto. Combina bem com uma estratégia de <a href="/glossario/buy-and-hold">buy and hold</a>.',
    ],
    related: ['alocacao-carteira', 'diversificacao', 'buy-and-hold', 'risco'],
    backlink: {
      label: 'Projetar seus aportes e simular a carteira no tempo',
      to: '/calculadora/juros-compostos',
    },
    faq: [
      {
        q: 'Com que frequência devo rebalancear a carteira?',
        a: 'Depende da sua estratégia. Muitos investidores rebalanceiam por calendário (uma ou duas vezes por ano) ou por desvio (quando uma classe sai alguns pontos percentuais do alvo). O importante é ter uma regra clara e segui-la, para não rebalancear no impulso.',
      },
      {
        q: 'Rebalancear gera imposto de renda?',
        a: 'Pode gerar. Vender um ativo com lucro é fato gerador de imposto sobre o ganho de capital, conforme as regras de cada classe. Uma forma de reduzir esse custo é rebalancear pelos novos aportes, comprando a classe defasada em vez de vender a que subiu.',
      },
    ],
  },
  {
    slug: 'risco',
    term: 'Risco',
    letter: 'R',
    short:
      'Risco em investimentos é a possibilidade de perda ou de não atingir o retorno esperado. Regra geral, retorno maior exige a disposição de assumir mais risco.',
    body: [
      'O <strong>risco</strong> é a possibilidade de o investimento render menos do que o esperado, ou de gerar perda. Ele é inseparável de qualquer aplicação: não existe retorno sem risco, e a decisão do investidor não é eliminá-lo, e sim escolher quanto está disposto a assumir em troca de qual retorno potencial.',
      'Existem vários tipos: risco de mercado (os preços oscilam), risco de <a href="/glossario/liquidez">liquidez</a> (dificuldade de vender no momento e no preço desejados), risco de crédito (o emissor não pagar), risco de inflação (o poder de compra encolher) e risco de concentração (patrimônio demais em um único ativo). Cada classe de ativo mistura esses riscos em proporções diferentes.',
      'A relação básica é direta: quanto maior o risco assumido, maior o retorno que o investidor deve exigir para compensá-lo. Um título público de baixo risco tende a render perto da <a href="/glossario/selic">Selic</a>; ações oscilam muito mais e, por isso, precisam oferecer a perspectiva de um retorno maior no longo prazo, sem qualquer garantia.',
      'Gerenciar risco é possível: <a href="/glossario/diversificacao">diversificar</a> entre ativos e classes, dimensionar a <a href="/glossario/alocacao-carteira">alocação</a> conforme o seu perfil, alongar o horizonte e, sobretudo, investir apenas no que você entende. Indicadores como o <a href="/glossario/beta">beta</a> e a <a href="/glossario/volatilidade">volatilidade</a> ajudam a medir parte desse risco de forma objetiva.',
    ],
    related: ['volatilidade', 'diversificacao', 'beta', 'alocacao-carteira'],
    backlink: {
      label: 'Avaliar a qualidade das empresas pelo Aportou Score',
      to: '/ranking/redentia-score',
    },
    faq: [
      {
        q: 'Como reduzir o risco dos investimentos?',
        a: 'As principais ferramentas são diversificação (não concentrar em um ativo ou setor), alocação adequada ao seu perfil e horizonte, e conhecimento do que você compra. Nenhuma delas elimina o risco, mas todas ajudam a controlá-lo e a evitar surpresas maiores do que você tolera.',
      },
      {
        q: 'Existe investimento sem risco?',
        a: 'Não existe risco zero. Mesmo aplicações consideradas muito seguras, como títulos públicos, carregam risco de inflação e de oscilação de preço antes do vencimento. A diferença entre os ativos é o tipo e o tamanho do risco, não a ausência dele.',
      },
    ],
  },
  {
    slug: 'beta',
    term: 'Beta',
    letter: 'B',
    short:
      'Beta mede quanto uma ação tende a oscilar em relação ao mercado. Beta acima de 1 indica um papel mais volátil que o índice; abaixo de 1, menos volátil.',
    body: [
      'O <strong>beta</strong> é um indicador estatístico que compara a oscilação de uma ação com a do mercado, geralmente representado pelo <a href="/glossario/ibovespa">Ibovespa</a>. Em outras palavras, ele estima se o papel costuma se mover mais, menos ou na mesma intensidade que o índice de referência.',
      'A leitura é direta: beta igual a 1 significa que a ação tende a acompanhar o índice; beta acima de 1 indica um papel mais volátil (com beta 1,5, a tendência é oscilar cerca de 50% mais que o índice, para cima e para baixo); beta abaixo de 1 indica um papel mais estável. Um beta negativo, mais raro, sugere um ativo que costuma andar na direção contrária ao mercado.',
      'Setores mais cíclicos e empresas menores costumam ter beta mais alto, enquanto setores defensivos, como energia elétrica e saneamento, tendem a apresentar beta mais baixo. O beta ajuda a montar uma carteira com o nível de oscilação desejado e entra em modelos de retorno esperado, mas descreve apenas o risco ligado ao mercado, não todo o risco de um ativo.',
      '<strong>Exemplo ilustrativo:</strong> uma ação com beta 1,2 tende a subir cerca de 12% quando o índice sobe 10%, e a cair na mesma proporção. É uma estimativa baseada no passado. O beta é calculado sobre um histórico de preços e não garante o comportamento futuro, então vale usá-lo junto de outras medidas de <a href="/glossario/risco">risco</a> e <a href="/glossario/volatilidade">volatilidade</a>.',
    ],
    related: ['volatilidade', 'risco', 'ibovespa', 'benchmark'],
    backlink: {
      label: 'Acompanhar o Ibovespa e o mercado em tempo real',
      to: '/',
    },
    faq: [
      {
        q: 'O que significa beta maior que 1?',
        a: 'Beta acima de 1 indica que a ação historicamente oscilou mais que o mercado. Se o índice de referência sobe ou cai, um papel com beta alto tende a se mover com intensidade maior, o que significa mais potencial de ganho e também mais risco de queda.',
      },
      {
        q: 'Beta baixo quer dizer investimento seguro?',
        a: 'Não exatamente. Beta baixo indica menor oscilação em relação ao mercado, mas não captura outros riscos, como problemas específicos da empresa, endividamento ou baixa liquidez. É uma medida parcial de risco, útil quando lida junto de outros indicadores.',
      },
    ],
  },
  {
    slug: 'alavancagem',
    term: 'Alavancagem',
    letter: 'A',
    short:
      'Alavancagem é operar com recurso emprestado ou com derivativos para movimentar um valor maior que o próprio capital. Amplifica tanto os ganhos quanto as perdas, e é estratégia de alto risco.',
    body: [
      'A <strong>alavancagem</strong> é usar capital de terceiros, crédito da corretora ou derivativos, para operar um valor maior do que o dinheiro que você efetivamente tem. O objetivo é potencializar o resultado, mas o efeito vale para os dois lados: ela amplifica os ganhos e, na mesma proporção, as perdas.',
      'Ela aparece de várias formas: margem oferecida pela corretora, contratos no mercado futuro, opções (em que um prêmio pequeno controla uma posição grande) e outros derivativos. Em todas elas, o <a href="/glossario/risco">risco</a> cresce junto com a exposição, e há custos e chamadas de margem envolvidos.',
      '<strong>Exemplo ilustrativo:</strong> com R$ 10 mil de capital e uma alavancagem de 5 vezes, você movimenta R$ 50 mil. Uma queda de 10% no ativo representa R$ 5 mil de prejuízo, ou seja, metade do seu capital, mesmo que o ativo tenha caído só 10%. Se a perda avança, pode superar o valor que você tinha. Os números são redondos apenas para ilustrar o mecanismo.',
      'O grande perigo é a chamada de margem: quando a perda avança, a corretora pode exigir mais garantia ou liquidar a posição no pior momento. A alavancagem é uma ferramenta de operadores experientes e de estratégias de <a href="/glossario/hedge">hedge</a>, não de quem está começando. Empresas também se alavancam com dívida, e o indicador <a href="/glossario/divida-liquida-ebitda">dívida líquida/EBITDA</a> ajuda a medir esse endividamento.',
    ],
    related: ['risco', 'day-trade', 'divida-liquida-ebitda', 'volatilidade'],
    backlink: {
      label: 'Aprender o básico antes de operar alavancado',
      to: '/guias/como-investir-em-acoes',
    },
    faq: [
      {
        q: 'Alavancagem é indicada para iniciantes?',
        a: 'Não. Alavancagem amplifica perdas e pode fazer o prejuízo superar o capital investido, além de expor o investidor a chamadas de margem. É uma ferramenta de operadores experientes. Quem está começando tende a se beneficiar mais de estratégias sem alavancagem e de longo prazo.',
      },
      {
        q: 'É possível perder mais do que investi ao alavancar?',
        a: 'Sim. Diferente de comprar um ativo à vista, onde a perda máxima é o valor aplicado, em posições alavancadas o prejuízo pode ultrapassar o capital inicial. É justamente esse risco de perda ampliada que torna a alavancagem uma operação de alto risco.',
      },
    ],
  },
  {
    slug: 'hedge',
    term: 'Hedge',
    letter: 'H',
    short:
      'Hedge é uma operação de proteção: uma posição montada para compensar perdas potenciais de outra, funcionando como um seguro que reduz risco em troca de parte do retorno.',
    body: [
      'O <strong>hedge</strong> (proteção, em inglês) é uma operação feita para neutralizar ou reduzir o risco de outra posição. A lógica é a de um seguro: você abre mão de parte do retorno potencial em troca de proteção contra um cenário adverso, como uma queda de preço, uma variação cambial ou uma alta de juros.',
      'Os instrumentos mais comuns são o mercado futuro, as opções e os swaps, além da simples combinação de ativos que tendem a se mover em direções opostas. Um exportador pode travar o câmbio de um recebimento futuro; um investidor pode comprar uma opção de venda para limitar a queda de uma posição em ações.',
      '<strong>Exemplo ilustrativo:</strong> quem tem uma carteira de ações e teme uma correção pode comprar uma opção de venda (put). Se as ações caem, a put se valoriza e compensa parte da perda; se as ações sobem, perde-se apenas o prêmio pago pela proteção. É o mesmo raciocínio de pagar por um seguro que você espera não precisar usar.',
      'Todo hedge tem custo (prêmio, spread ou renúncia de ganho), então ele reduz o <a href="/glossario/risco">risco</a> e, com ele, o retorno esperado. É mais usado por empresas e investidores mais sofisticados. Para a maioria das pessoas físicas, a <a href="/glossario/diversificacao">diversificação</a> e uma parcela em ativos defensivos, como o <a href="/glossario/tesouro-selic">Tesouro Selic</a>, já cumprem boa parte do papel de proteção.',
    ],
    related: ['risco', 'volatilidade', 'tesouro-selic', 'diversificacao'],
    backlink: {
      label: 'Conhecer os títulos de renda fixa que protegem a carteira',
      to: '/tesouro',
    },
    faq: [
      {
        q: 'Hedge elimina o risco?',
        a: 'Não. O hedge reduz ou neutraliza um risco específico, mas não zera o risco total nem sai de graça. Ele tem um custo (prêmio, spread ou renúncia de retorno), e uma proteção mal dimensionada pode inclusive criar novos riscos. É controle de risco, não garantia de resultado.',
      },
      {
        q: 'Preciso fazer hedge na minha carteira?',
        a: 'Nem sempre. Hedge com derivativos é mais comum entre empresas e investidores sofisticados. Para a maioria das pessoas físicas de longo prazo, diversificar e manter uma parcela em ativos mais defensivos costuma proteger a carteira sem a complexidade e o custo de operações estruturadas.',
      },
    ],
  },
  {
    slug: 'analise-tecnica',
    term: 'Análise Técnica',
    letter: 'A',
    short:
      'Análise técnica estuda gráficos de preço e volume em busca de padrões e tendências para orientar decisões de compra e venda, sobretudo no curto e médio prazo.',
    body: [
      'A <strong>análise técnica</strong> estuda o histórico de preços e de volume de um ativo, representado em gráficos, para tentar antecipar movimentos futuros. Ela parte de três premissas: o preço já reflete as informações disponíveis, os preços se movem em tendências e certos padrões de comportamento tendem a se repetir.',
      'O ferramental inclui gráficos de candlestick (velas), indicadores como médias móveis, IFR e MACD, e conceitos como suporte, resistência e linhas de tendência. O objetivo, na maioria das vezes, é definir pontos de entrada e de saída, não avaliar a qualidade do negócio por trás da ação.',
      'É a abordagem preferida de quem opera em prazos mais curtos, como <a href="/glossario/day-trade">day trade</a> e <a href="/glossario/swing-trade">swing trade</a>, e costuma ser usada para cronometrar operações. Muitos investidores a combinam com a <a href="/glossario/analise-fundamentalista">análise fundamentalista</a>: uma decide o que comprar, a outra ajuda a decidir quando.',
      'A ressalva honesta é que a análise técnica não é uma bola de cristal. Sinais falsos são frequentes, os padrões não se confirmam sempre e a eficácia do método é objeto de debate acadêmico. Ela lida com probabilidades e gestão de <a href="/glossario/risco">risco</a>, não com certezas, e exige disciplina para funcionar como ferramenta.',
    ],
    related: ['analise-fundamentalista', 'day-trade', 'swing-trade', 'volatilidade'],
    backlink: {
      label: 'Ver o gráfico de preço de PETR4',
      to: '/asset/PETR4',
    },
    faq: [
      {
        q: 'Qual a diferença entre análise técnica e fundamentalista?',
        a: 'A análise técnica estuda gráficos de preço e volume para cronometrar operações, geralmente de curto e médio prazo. A fundamentalista avalia os números e a qualidade do negócio para estimar o valor justo da empresa, com foco no longo prazo. Muitos investidores combinam as duas.',
      },
      {
        q: 'Análise técnica funciona mesmo?',
        a: 'É um método popular entre operadores de curto prazo, mas sua eficácia é debatida e os sinais falsos são comuns. Ela lida com probabilidades, não com previsões garantidas. Depende de disciplina, gestão de risco e não substitui a compreensão do ativo que você está negociando.',
      },
    ],
  },
  {
    slug: 'analise-fundamentalista',
    term: 'Análise Fundamentalista',
    letter: 'A',
    short:
      'Análise fundamentalista avalia os números e a qualidade de uma empresa para estimar seu valor justo e decidir se a ação está cara ou barata. É a base do investimento de longo prazo.',
    body: [
      'A <strong>análise fundamentalista</strong> busca estimar o valor justo de uma empresa para comparar com o preço de mercado e responder a uma pergunta simples: a ação está cara ou barata em relação ao que o negócio realmente vale? É a base do investimento de longo prazo e do <a href="/glossario/buy-and-hold">buy and hold</a>.',
      'A parte quantitativa olha indicadores como <a href="/glossario/p-l">P/L</a>, P/VP, <a href="/glossario/roe">ROE</a>, <a href="/glossario/margem-liquida">margem líquida</a>, endividamento e crescimento de receita e lucro. A parte qualitativa avalia a qualidade da gestão, as vantagens competitivas, a governança e o setor. O pano de fundo macroeconômico (juros, câmbio, ciclo) completa a leitura.',
      'O objetivo é encontrar empresas de qualidade negociadas abaixo do seu valor justo, criando uma margem de segurança entre o preço pago e o valor estimado. É a filosofia associada a investidores como Benjamin Graham, Warren Buffett e, no Brasil, Luiz Barsi. Uma forma de transformar lucro, patrimônio e dividendo em um teto de preço é a conta de preço teto (Bazin, Graham, P/L setorial, valor patrimonial e projetivo). O passo a passo está no <a href="/guias/como-calcular-preco-teto">guia de como calcular preço teto</a>. O número é uma régua, não uma recomendação de compra ou venda.',
      'A ressalva honesta é que o valor justo é uma estimativa, sensível às premissas de quem calcula, e o mercado pode levar tempo para reconhecer uma tese. Por isso a análise fundamentalista combina bem com paciência e com diversificação, e costuma ser usada junto de uma leitura de preço via <a href="/glossario/analise-tecnica">análise técnica</a> para o momento da compra.',
    ],
    related: ['analise-tecnica', 'buy-and-hold', 'roe', 'p-l', 'margem-liquida'],
    backlink: {
      label: 'Ver as ações mais baratas pela fórmula de Graham',
      to: '/ranking/mais-baratas-graham',
    },
    faq: [
      {
        q: 'O que a análise fundamentalista avalia?',
        a: 'Ela combina números (indicadores como P/L, P/VP, ROE, margens, endividamento e crescimento) com fatores qualitativos (gestão, vantagens competitivas, governança e setor) e o cenário macroeconômico. O objetivo é estimar o valor justo da empresa e compará-lo com o preço da ação.',
      },
      {
        q: 'Análise fundamentalista serve para o curto prazo?',
        a: 'Ela é pensada para o longo prazo. O mercado pode levar meses ou anos para fazer o preço convergir para o valor estimado de uma empresa. Para decisões de curto prazo, muitos investidores complementam com análise técnica, que foca no comportamento do preço.',
      },
    ],
  },
  {
    slug: 'lucro-liquido',
    term: 'Lucro Líquido',
    letter: 'L',
    short:
      'Lucro líquido é o resultado final da empresa depois de descontar todos os custos, despesas, juros e impostos. É o que efetivamente sobra para os acionistas.',
    body: [
      'O <strong>lucro líquido</strong> é a última linha do resultado de uma empresa, o que sobra depois de deduzir todos os custos, despesas operacionais, despesas financeiras (juros) e impostos da receita. É o lucro que, de fato, pertence aos acionistas, por isso é chamado de bottom line.',
      'O caminho até ele parte da receita: subtraem-se os impostos sobre vendas e os custos dos produtos para chegar ao lucro bruto; retiram-se as despesas operacionais e se obtém o <a href="/glossario/ebit">EBIT</a>; descontam-se juros e, por fim, imposto de renda e contribuição social. O que resta é o lucro líquido.',
      'Ele é a base de vários indicadores centrais: alimenta o <a href="/glossario/lpa">lucro por ação</a>, entra no cálculo do <a href="/glossario/p-l">P/L</a>, sustenta o <a href="/glossario/roe">ROE</a> e é a fonte de onde saem os <a href="/glossario/dividendos">dividendos</a>. Uma empresa que cresce o lucro líquido de forma consistente tende a gerar mais valor para o acionista ao longo do tempo.',
      'A ressalva honesta é que lucro contábil não é o mesmo que caixa. Uma empresa pode registrar lucro e, ainda assim, ter pouco dinheiro em caixa (por vendas a prazo, por exemplo) ou inflar o resultado com itens não recorrentes. Por isso o lucro líquido costuma ser lido junto da geração de caixa e da <a href="/glossario/margem-liquida">margem líquida</a>.',
    ],
    related: ['lpa', 'p-l', 'margem-liquida', 'roe', 'dividendos'],
    backlink: {
      label: 'Comparar as ações pelo P/L, que mede preço sobre lucro',
      to: '/ranking/menores-pl',
    },
    faq: [
      {
        q: 'Qual a diferença entre lucro líquido e EBITDA?',
        a: 'O lucro líquido é o resultado final, já descontados juros, impostos, depreciação e amortização. O EBITDA mede o resultado operacional antes desses itens. O EBITDA aproxima a geração de caixa da operação; o lucro líquido mostra o que sobra de fato para o acionista.',
      },
      {
        q: 'Lucro líquido alto sempre significa boa empresa?',
        a: 'Não necessariamente. O lucro pode conter itens não recorrentes (venda de ativos, ganhos pontuais) que não se repetem, e lucro contábil não é caixa. Vale checar a consistência do lucro ao longo dos anos, a margem líquida e a geração de caixa antes de concluir.',
      },
    ],
  },
  {
    slug: 'patrimonio-liquido',
    term: 'Patrimônio Líquido',
    letter: 'P',
    short:
      'Patrimônio líquido é o valor contábil que pertence aos acionistas: o total de ativos menos o total de passivos da empresa. Também chamado de capital próprio.',
    body: [
      'O <strong>patrimônio líquido</strong> (PL) é a parcela da empresa que pertence aos donos depois de quitadas todas as obrigações. A conta é direta: <strong>patrimônio líquido = ativo total − passivo total</strong>, ou seja, tudo o que a empresa tem menos tudo o que ela deve. Também é chamado de capital próprio.',
      'Ele é composto pelo capital social (o que os sócios aportaram), pelas reservas de lucros (lucros retidos e não distribuídos), por ajustes de avaliação e por eventuais ações em tesouraria. Quando a empresa lucra e retém parte desse lucro, o patrimônio líquido cresce, sinal de acumulação de valor ao longo do tempo.',
      'O PL é a base de indicadores importantes: o <a href="/glossario/roe">ROE</a> mede o retorno sobre esse patrimônio, o <a href="/glossario/vpa">valor patrimonial por ação</a> divide o PL pelo número de ações, e o <a href="/glossario/p-vp">P/VP</a> compara o preço de mercado com esse valor contábil.',
      'A ressalva honesta é que um patrimônio líquido negativo, quando as dívidas superam os ativos, costuma ser um forte sinal de alerta, geralmente ligado a prejuízos acumulados. Por outro lado, o valor contábil nem sempre reflete o valor de mercado do negócio: marcas, tecnologia e capacidade de gerar <a href="/glossario/lucro-liquido">lucro</a> podem valer bem mais (ou menos) do que os números do balanço.',
    ],
    related: ['roe', 'vpa', 'p-vp', 'lucro-liquido'],
    backlink: {
      label: 'Ver as ações com maior retorno sobre o patrimônio (ROE)',
      to: '/ranking/maiores-roe',
    },
    faq: [
      {
        q: 'Como se calcula o patrimônio líquido de uma empresa?',
        a: 'O patrimônio líquido é o ativo total menos o passivo total, ou seja, tudo o que a empresa possui menos tudo o que ela deve. O resultado representa o valor contábil que pertence aos acionistas, também chamado de capital próprio.',
      },
      {
        q: 'O que significa patrimônio líquido negativo?',
        a: 'Significa que as dívidas da empresa superam seus ativos, geralmente por acúmulo de prejuízos. É um sinal de alerta relevante sobre a saúde financeira, embora precise ser analisado no contexto do setor e da capacidade de recuperação do negócio.',
      },
    ],
  },
  {
    slug: 'bonificacao',
    term: 'Bonificação',
    letter: 'B',
    short:
      'Bonificação é a distribuição de novas ações aos acionistas, sem custo e na proporção do que cada um possui, quando a empresa incorpora reservas ao capital social. O preço da ação se ajusta e o patrimônio do investidor não muda.',
    body: [
      'A <strong>bonificação</strong> ocorre quando a empresa incorpora reservas de lucros ao capital social e, com isso, emite novas ações que distribui gratuitamente aos acionistas, na proporção do que cada um já detém. Na prática, você recebe mais ações sem pagar por elas.',
      'O ponto importante é que você não fica mais rico com a bonificação em si. Ao mesmo tempo em que a quantidade de ações aumenta, o preço de cada uma se ajusta proporcionalmente para baixo, de modo que o valor total da sua posição permanece o mesmo. É um evento societário e contábil, não um ganho.',
      '<strong>Exemplo ilustrativo:</strong> numa bonificação de 10%, quem tinha 100 ações passa a ter 110. Se a posição valia R$ 5.000 antes, continua valendo R$ 5.000 depois, agora dividida em mais ações a um preço unitário menor. Os números são redondos apenas para mostrar a mecânica.',
      'Do ponto de vista tributário, a bonificação em geral não gera imposto no momento do recebimento; o imposto sobre eventual ganho aparece só na venda futura das ações. A bonificação é um dos <a href="/glossario/proventos">proventos</a> e não deve ser confundida com <a href="/glossario/dividendos">dividendos</a> (dinheiro) nem com o <a href="/glossario/desdobramento">desdobramento</a>, que tem efeito parecido mas origem contábil diferente.',
    ],
    related: ['desdobramento', 'proventos', 'dividendos', 'grupamento'],
    backlink: {
      label: 'Acompanhar o calendário de proventos de PETR4',
      to: '/dividendos/PETR4',
    },
    faq: [
      {
        q: 'Bonificação em ações deixa o investidor mais rico?',
        a: 'Não. Você recebe mais ações, mas o preço de cada uma se ajusta para baixo na mesma proporção, mantendo o valor total da posição. É um evento contábil, não um ganho. A riqueza só aumenta se a empresa continuar gerando resultados e valorizando as ações depois.',
      },
      {
        q: 'Qual a diferença entre bonificação e desdobramento?',
        a: 'Os dois aumentam a quantidade de ações e reduzem o preço unitário, com valor total inalterado. A diferença está na origem: a bonificação incorpora reservas de lucros ao capital social e distribui ações novas, enquanto o desdobramento apenas divide as ações existentes, sem mexer no capital.',
      },
    ],
  },
  {
    slug: 'desdobramento',
    term: 'Desdobramento',
    letter: 'D',
    short:
      'Desdobramento (split) divide cada ação em várias, reduzindo o preço unitário na mesma proporção. Não altera o valor total investido, apenas torna a ação mais acessível e líquida.',
    body: [
      'O <strong>desdobramento</strong>, também chamado de <strong>split</strong>, é a divisão de cada ação existente em duas ou mais. A quantidade de papéis aumenta e o preço unitário cai na mesma proporção, de forma que o valor total da posição e o valor da empresa não mudam.',
      'O objetivo costuma ser reduzir o preço da ação para torná-la mais acessível a pequenos investidores e, com isso, aumentar a <a href="/glossario/liquidez">liquidez</a> e o volume negociado. Diferente da <a href="/glossario/bonificacao">bonificação</a>, o desdobramento não incorpora reservas ao capital: ele apenas reparte as ações que já existem.',
      '<strong>Exemplo ilustrativo:</strong> num desdobramento de 1 para 2, quem tinha 100 ações a R$ 100 passa a ter 200 ações a R$ 50. A posição continua valendo R$ 10.000, apenas fracionada em mais papéis de preço menor. Os números são redondos, só para mostrar a lógica.',
      'O impacto no patrimônio do investidor e no valor da empresa é nulo; o efeito prático é operacional, mais liquidez e um preço por ação mais amigável. A operação inversa é o <a href="/glossario/grupamento">grupamento</a>, que junta várias ações em uma e costuma aparecer em contextos bem diferentes.',
    ],
    related: ['grupamento', 'bonificacao', 'proventos'],
    backlink: {
      label: 'Consultar o histórico de preço ajustado de PETR4',
      to: '/asset/PETR4',
    },
    faq: [
      {
        q: 'O desdobramento de ações muda o valor investido?',
        a: 'Não. O desdobramento aumenta a quantidade de ações e reduz o preço unitário na mesma proporção, mantendo o valor total da posição. É uma mudança operacional que costuma melhorar a liquidez e deixar o preço por ação mais acessível.',
      },
      {
        q: 'Por que uma empresa faz desdobramento?',
        a: 'O motivo mais comum é tornar a ação mais acessível a pequenos investidores quando o preço unitário fica muito alto, ampliando a base de compradores e a liquidez. Não é um sinal de melhora ou piora dos fundamentos, apenas um ajuste na quantidade de papéis.',
      },
    ],
  },
  {
    slug: 'grupamento',
    term: 'Grupamento',
    letter: 'G',
    short:
      'Grupamento (inplit) junta várias ações em uma só, elevando o preço unitário na mesma proporção. É o oposto do desdobramento e costuma ocorrer em ações que caíram muito.',
    body: [
      'O <strong>grupamento</strong>, também chamado de <strong>inplit</strong>, é o inverso do <a href="/glossario/desdobramento">desdobramento</a>: várias ações são reunidas em uma, e o preço unitário sobe na mesma proporção. Assim como no split, o valor total da posição e o valor da empresa não mudam no momento da operação.',
      'A motivação mais comum é tirar a ação da faixa de preços muito baixos. Papéis que negociam por centavos passam uma impressão ruim, ficam sujeitos a maior oscilação percentual a cada centavo e podem esbarrar em exigências da bolsa. O grupamento eleva o preço unitário para uma faixa considerada mais adequada.',
      '<strong>Exemplo ilustrativo:</strong> num grupamento de 10 para 1, quem tinha 1.000 ações a R$ 1,00 passa a ter 100 ações a R$ 10,00. A posição continua valendo R$ 1.000, apenas concentrada em menos papéis de preço maior. Números redondos, só para ilustrar.',
      'A ressalva honesta é de contexto: o grupamento costuma aparecer em empresas cuja ação caiu muito, e ele é cosmético, não resolve os problemas do negócio. Grupamentos recorrentes tendem a ser um sinal de alerta. Vale investigar os fundamentos antes de tratar o preço mais alto como recuperação, especialmente em <a href="/glossario/small-caps">small caps</a>.',
    ],
    related: ['desdobramento', 'bonificacao', 'small-caps'],
    backlink: {
      label: 'Entender riscos e oportunidades das small caps',
      to: '/guias/small-caps-guia-completo',
    },
    faq: [
      {
        q: 'Grupamento de ações é um bom ou mau sinal?',
        a: 'Em si, o grupamento é neutro para o patrimônio, mas ele costuma acontecer em ações que caíram muito de preço. Por isso, é frequentemente um sinal de alerta sobre a situação da empresa. Grupamentos recorrentes merecem atenção especial aos fundamentos do negócio.',
      },
      {
        q: 'O grupamento faz eu perder dinheiro?',
        a: 'No momento do grupamento, não: você fica com menos ações a um preço unitário maior, e o valor total permanece igual. O que pode gerar perda é o cenário que costuma cercar a operação, empresas em dificuldade cuja ação já vinha caindo e pode continuar caindo.',
      },
    ],
  },
  {
    slug: 'corretora',
    term: 'Corretora de Valores',
    letter: 'C',
    short:
      'Corretora de valores é a instituição, regulada pela CVM, que intermedeia a compra e a venda de ativos na bolsa. É por meio dela que o investidor acessa ações, FIIs, renda fixa e outros produtos.',
    body: [
      'A <strong>corretora de valores</strong> é a porta de entrada para investir na bolsa. O investidor não compra ações diretamente na <a href="/glossario/b3">B3</a>: ele precisa de uma corretora, que recebe suas ordens e as executa no mercado, além de oferecer a plataforma de negociação e os relatórios de rendimentos.',
      'Entre suas funções estão intermediar as ordens de compra e venda, disponibilizar o <a href="/glossario/home-broker">home broker</a>, dar acesso a produtos de renda fixa, fundos e ofertas públicas, e emitir os informes usados na declaração de imposto. Algumas oferecem também assessoria e conteúdo. Todas são reguladas e fiscalizadas pela <a href="/glossario/cvm">CVM</a>.',
      'Na hora de escolher, vale comparar taxas (corretagem e custódia, hoje muitas vezes zero), a qualidade e a estabilidade da plataforma, a variedade de produtos disponíveis, o atendimento e a reputação da instituição. O custo já não é o único critério, já que a corretagem zerou em boa parte do mercado.',
      'Um ponto de segurança importante: a corretora é intermediária, não a guardiã final dos seus ativos. Ações e outros papéis ficam registrados em seu nome na <a href="/glossario/custodia">custódia</a> da B3. Se a corretora tiver problemas, os ativos continuam sendo seus e podem ser transferidos para outra instituição.',
    ],
    related: ['b3', 'home-broker', 'custodia', 'cvm'],
    backlink: {
      label: 'Explorar o que comprar através da sua corretora',
      to: '/rankings',
    },
    faq: [
      {
        q: 'É seguro deixar meus investimentos na corretora?',
        a: 'Os ativos negociados em bolsa ficam registrados em seu nome na custódia da B3, não dentro da corretora, que atua como intermediária. Se a corretora tiver problemas, seus ativos continuam sendo seus e podem ser transferidos para outra instituição. Ainda assim, vale escolher instituições reguladas e de boa reputação.',
      },
      {
        q: 'Como escolher uma corretora?',
        a: 'Compare as taxas de corretagem e custódia (hoje muitas são zero), a qualidade e a estabilidade da plataforma, a variedade de produtos oferecidos, o atendimento e a reputação. Verifique também se a instituição é regulada pela CVM. O menor custo não é o único critério.',
      },
    ],
  },
  {
    slug: 'cvm',
    term: 'CVM',
    letter: 'C',
    short:
      'A CVM (Comissão de Valores Mobiliários) é o órgão que regula e fiscaliza o mercado de capitais brasileiro, protegendo investidores e supervisionando bolsa, corretoras, empresas listadas e fundos.',
    body: [
      'A <strong>CVM</strong>, sigla de <strong>Comissão de Valores Mobiliários</strong>, é a autarquia federal que regula e fiscaliza o mercado de capitais no Brasil. Criada em 1976, funciona como o xerife do mercado: seu papel é proteger o investidor e garantir que a bolsa, as empresas e os intermediários operem com transparência e dentro das regras.',
      'Entre suas atribuições estão fiscalizar a <a href="/glossario/b3">B3</a>, regulamentar as <a href="/glossario/corretora">corretoras</a> e os fundos de investimento, aprovar ofertas públicas como os <a href="/glossario/ipo">IPOs</a>, exigir transparência das empresas listadas e punir irregularidades, como uso de informação privilegiada e manipulação de mercado.',
      'A CVM tem poder para multar, suspender a negociação de ativos, proibir administradores de atuar e investigar fraudes. Para o investidor, isso significa um ambiente com regras claras e um canal para denúncias, além de uma enorme base de informações públicas sobre as empresas de capital aberto.',
      'Vale usá-la a seu favor: consultar se uma corretora ou um assessor está regularizado, acessar demonstrações e comunicados obrigatórios das companhias e verificar informações antes de investir. A CVM brasileira desempenha papel semelhante ao da SEC nos Estados Unidos e é uma peça central do <a href="/glossario/novo-mercado">arcabouço de governança</a> do mercado.',
    ],
    related: ['b3', 'corretora', 'ipo', 'novo-mercado'],
    backlink: {
      label: 'Avaliar empresas listadas pelo Aportou Score',
      to: '/ranking/redentia-score',
    },
    faq: [
      {
        q: 'O que a CVM faz na prática?',
        a: 'A CVM regula e fiscaliza o mercado de capitais: supervisiona a bolsa e as corretoras, aprova ofertas públicas, exige transparência das empresas listadas e pune irregularidades como manipulação e uso de informação privilegiada. O objetivo é proteger o investidor e manter o mercado íntegro.',
      },
      {
        q: 'A CVM garante que eu não vou perder dinheiro?',
        a: 'Não. A CVM garante regras, transparência e fiscalização, mas não protege contra as oscilações normais do mercado nem contra decisões de investimento. O risco de perda continua existindo. O papel dela é assegurar um ambiente justo e informado, não rentabilidade.',
      },
    ],
  },
  {
    slug: 'ipca',
    term: 'IPCA',
    letter: 'I',
    short:
      'O IPCA (Índice Nacional de Preços ao Consumidor Amplo) é o índice oficial de inflação do Brasil, calculado pelo IBGE, e serve de referência para a meta de inflação e para títulos como o Tesouro IPCA+.',
    body: [
      'O <strong>IPCA</strong>, sigla de <strong>Índice Nacional de Preços ao Consumidor Amplo</strong>, é o indicador oficial de <a href="/glossario/inflacao">inflação</a> do Brasil, calculado mensalmente pelo IBGE. Ele mede a variação de preços de uma cesta de bens e serviços consumidos pelas famílias, de alimentação e moradia a transporte, saúde e educação.',
      'Sua importância vai além da estatística: o IPCA é o índice usado na meta de inflação perseguida pelo Banco Central, corrige contratos e aluguéis e serve de referência para reajustes e para investimentos. Quando o IPCA sobe acima da meta, o <a href="/glossario/copom">COPOM</a> tende a elevar a <a href="/glossario/selic">Selic</a> para conter a alta de preços.',
      'Para o investidor, o IPCA é a régua do ganho real: só há ganho de verdade quando o investimento rende acima da inflação do período. É por isso que existe o <a href="/glossario/tesouro-ipca">Tesouro IPCA+</a>, um título que paga a variação do IPCA mais uma taxa fixa, protegendo o poder de compra ao longo do tempo.',
      '<strong>Exemplo ilustrativo:</strong> se o IPCA de um ano fica em torno de 4,5%, um investimento precisa render mais que isso apenas para preservar o poder de compra. Um retorno de 4,5% nesse cenário significaria ganho real zero. O número é hipotético, apenas para mostrar o raciocínio do ganho real.',
    ],
    related: ['inflacao', 'tesouro-ipca', 'selic', 'copom'],
    backlink: {
      label: 'Ver os títulos do Tesouro que acompanham o IPCA',
      to: '/tesouro',
    },
    faq: [
      {
        q: 'O que é o IPCA e quem calcula?',
        a: 'O IPCA é o Índice Nacional de Preços ao Consumidor Amplo, o indicador oficial de inflação do Brasil. É calculado mensalmente pelo IBGE a partir da variação de preços de uma cesta de bens e serviços consumidos pelas famílias e serve de base para a meta de inflação do país.',
      },
      {
        q: 'Como o IPCA afeta meus investimentos?',
        a: 'O IPCA é a referência de ganho real: só há ganho efetivo quando o investimento rende acima da inflação. Títulos como o Tesouro IPCA+ pagam a variação do índice mais uma taxa fixa, protegendo o poder de compra. Aplicações que rendem abaixo do IPCA perdem poder de compra.',
      },
    ],
  },
  {
    slug: 'inflacao',
    term: 'Inflação',
    letter: 'I',
    short:
      'Inflação é o aumento generalizado e contínuo dos preços, que reduz o poder de compra do dinheiro ao longo do tempo. É um dos principais adversários do investidor de longo prazo.',
    body: [
      'A <strong>inflação</strong> é a alta generalizada e persistente dos preços de bens e serviços. Na prática, ela significa que o dinheiro perde valor com o tempo: a mesma quantia compra menos hoje do que comprava anos atrás. É por isso que preservar poder de compra é um objetivo central de qualquer investidor.',
      'Ela pode ser puxada por demanda maior que a oferta numa economia aquecida, por aumento de custos (energia, câmbio, salários) ou por excesso de moeda em circulação. As próprias expectativas alimentam o processo: se todos esperam preços mais altos, tendem a reajustar preços e contratos, e a inflação se realimenta.',
      'No Brasil, a inflação é medida principalmente pelo <a href="/glossario/ipca">IPCA</a>, que serve de base para a meta do Banco Central. Quando a inflação acelera, o <a href="/glossario/copom">COPOM</a> costuma subir a <a href="/glossario/selic">Selic</a> para esfriar a demanda e trazer os preços de volta à meta.',
      'Para se proteger, o investidor recorre a ativos que tendem a acompanhar ou superar a inflação: o <a href="/glossario/tesouro-ipca">Tesouro IPCA+</a>, imóveis e fundos imobiliários com aluguéis corrigidos, e ações de empresas capazes de repassar custos. A ressalva honesta é que nenhuma proteção é perfeita, e o objetivo prático é buscar consistentemente um ganho real, acima da inflação, ao longo do tempo.',
    ],
    related: ['ipca', 'tesouro-ipca', 'selic', 'cdi'],
    backlink: {
      label: 'Simular quanto seu dinheiro precisa render pra bater a inflação',
      to: '/calculadora/aposentadoria',
    },
    faq: [
      {
        q: 'Como proteger meus investimentos da inflação?',
        a: 'As alternativas mais usadas são títulos atrelados ao IPCA (como o Tesouro IPCA+), fundos imobiliários com aluguéis corrigidos e ações de empresas capazes de repassar custos. Nenhuma proteção é perfeita, mas todas buscam garantir ganho real, ou seja, rendimento acima da inflação.',
      },
      {
        q: 'O que é ganho real?',
        a: 'Ganho real é o retorno de um investimento descontada a inflação do período. Se uma aplicação rende 10% num ano em que a inflação foi 4%, o ganho real foi de aproximadamente 6%. É o que efetivamente aumenta o seu poder de compra; o resto apenas repõe a perda de valor da moeda.',
      },
    ],
  },
  {
    slug: 'custodia',
    term: 'Custódia',
    letter: 'C',
    short:
      'Custódia é o serviço de guarda e registro dos seus ativos. Na bolsa, quem custodia é a B3, que mantém os papéis registrados no seu CPF, e não a corretora.',
    body: [
      'A <strong>custódia</strong> é o serviço de guarda, registro e administração dos seus investimentos. É onde os ativos ficam formalmente registrados como seus. No mercado de ações brasileiro, a custódia é feita pela <a href="/glossario/b3">B3</a>, que mantém os papéis em nome do investidor, vinculados ao seu CPF.',
      'Isso traz uma consequência importante de segurança: quando você compra ações por uma <a href="/glossario/corretora">corretora</a>, quem guarda os papéis é a B3, não a corretora. A corretora é apenas a intermediária das ordens. Se ela tiver problemas, seus ativos continuam registrados em seu nome na custódia e podem ser transferidos para outra instituição.',
      'O investidor pode consultar tudo o que possui, em todas as corretoras, na Área do Investidor da B3, com histórico de movimentações e proventos recebidos. A B3 cobra uma taxa mínima de custódia, que muitas corretoras isentam ou repassam por valores baixos.',
      'Nem todo ativo é custodiado no mesmo lugar: renda fixa pode ficar registrada na corretora ou na B3 conforme o tipo, títulos do <a href="/glossario/tesouro-direto">Tesouro Direto</a> ficam no sistema do Tesouro Nacional, e cotas de fundos na administradora. É possível transferir ativos de custódia entre corretoras sem precisar vender e recomprar.',
    ],
    related: ['b3', 'corretora', 'home-broker', 'tesouro-direto'],
    backlink: {
      label: 'Consolidar a custódia de todas as suas corretoras',
      to: '/guias/open-finance',
    },
    faq: [
      {
        q: 'Se minha corretora quebrar, perco meus investimentos?',
        a: 'Os ativos negociados em bolsa ficam custodiados na B3, registrados no seu CPF, e não dentro da corretora. Se a corretora tiver problemas, seus papéis continuam sendo seus e podem ser transferidos para outra instituição. A corretora é intermediária, não a guardiã final dos ativos.',
      },
      {
        q: 'O que é taxa de custódia?',
        a: 'É a taxa cobrada pela guarda e pelo registro dos ativos. A B3 cobra um valor mínimo de custódia, e algumas corretoras repassam esse custo ou cobram uma taxa própria, embora muitas isentem. Vale conferir esse custo ao comparar corretoras.',
      },
    ],
  },
  {
    slug: 'copom',
    term: 'COPOM',
    letter: 'C',
    short:
      'O COPOM (Comitê de Política Monetária) é o colegiado do Banco Central que define a meta da Taxa Selic. Reúne-se cerca de oito vezes por ano e sua decisão é uma das mais aguardadas pelo mercado.',
    body: [
      'O <strong>COPOM</strong>, sigla de <strong>Comitê de Política Monetária</strong>, é o órgão do Banco Central responsável por definir a meta da <a href="/glossario/selic">Taxa Selic</a>, a taxa básica de juros da economia. É formado pelo presidente e pelos diretores do BC, e sua decisão está entre as mais esperadas e impactantes do calendário financeiro.',
      'O comitê se reúne cerca de oito vezes por ano, em datas pré-definidas, aproximadamente a cada 45 dias. A cada reunião, analisa a <a href="/glossario/inflacao">inflação</a>, o ritmo da atividade econômica e o câmbio, decide se sobe, mantém ou reduz a Selic e publica uma ata explicando os motivos e sinalizando o caminho futuro.',
      'As decisões do COPOM se espalham por toda a economia. Quando a Selic sobe, a renda fixa passa a render mais e tende a pressionar as ações; quando cai, ocorre o inverso. Financiamentos, crédito e a atratividade relativa entre renda fixa e renda variável se ajustam a cada movimento.',
      'O mercado costuma antecipar a decisão e precificar uma expectativa antes da reunião. Quando o COPOM surpreende, cortando ou subindo mais do que o esperado, a reação nos preços tende a ser mais forte. Acompanhar o comitê ajuda a entender por que a rentabilidade dos títulos atrelados ao <a href="/glossario/cdi">CDI</a> muda ao longo do tempo.',
    ],
    related: ['selic', 'ipca', 'inflacao', 'cdi'],
    backlink: {
      label: 'Ver o ranking do Tesouro Direto e as taxas atuais',
      to: '/ranking/tesouro-direto',
    },
    faq: [
      {
        q: 'De quanto em quanto tempo o COPOM se reúne?',
        a: 'O COPOM realiza cerca de oito reuniões ordinárias por ano, em datas pré-definidas, com intervalo de aproximadamente 45 dias entre elas. A decisão sobre a Selic é anunciada ao fim da reunião, e a ata com as justificativas é divulgada alguns dias depois.',
      },
      {
        q: 'Como a decisão do COPOM afeta meus investimentos?',
        a: 'A Selic definida pelo COPOM baliza toda a renda fixa e influencia a renda variável. Quando a Selic sobe, títulos de renda fixa rendem mais e as ações tendem a sofrer; quando cai, ocorre o contrário. Por isso, cada decisão do comitê mexe com a atratividade relativa dos ativos.',
      },
    ],
  },
  {
    slug: 'proventos',
    term: 'Proventos',
    letter: 'P',
    short:
      'Proventos são todas as formas de remuneração que o acionista recebe de uma empresa: dividendos, juros sobre capital próprio, bonificações e direitos de subscrição. É o termo guarda-chuva da distribuição ao investidor.',
    body: [
      'Os <strong>proventos</strong> são o termo guarda-chuva para tudo o que uma empresa distribui aos seus acionistas. Sempre que você ouvir falar em remuneração ao investidor por deter uma ação ou uma cota, provavelmente está diante de algum tipo de provento.',
      'Os principais são quatro. Os <a href="/glossario/dividendos">dividendos</a>, parcela do lucro distribuída em dinheiro e isenta de imposto de renda para a pessoa física até R$ 50 mil por mês da mesma empresa. O <a href="/glossario/jscp">JCP</a> (juros sobre capital próprio), semelhante em dinheiro, mas com 17,5% de imposto retido na fonte. A <a href="/glossario/bonificacao">bonificação</a>, distribuição de ações novas. E o direito de subscrição, a preferência para comprar novas ações, geralmente com desconto, que pode ser exercido ou vendido.',
      'Os proventos seguem um calendário próprio, com datas que vale conhecer: a <a href="/glossario/data-com">data com</a> (último dia para comprar e ter direito), a <a href="/glossario/data-ex">data ex</a> (a partir da qual a ação passa a negociar sem o provento) e a data de pagamento (quando o valor efetivamente cai na conta). A <a href="/dividendos/agenda">agenda de dividendos</a> reúne os avisos do mês. Fundos imobiliários, por regra, distribuem a maior parte do resultado com frequência costumeiramente mensal.',
      'Reinvestir proventos é uma das formas mais poderosas de acelerar o crescimento do patrimônio no longo prazo, pelo efeito dos juros compostos. Indicadores como <a href="/glossario/dividend-yield">dividend yield</a> e <a href="/glossario/payout">payout</a> ajudam a avaliar quanto uma empresa distribui e se essa distribuição é sustentável.',
    ],
    related: ['dividendos', 'jscp', 'bonificacao', 'payout'],
    backlink: {
      label: 'Ver o ranking das maiores pagadoras de proventos',
      to: '/ranking/maiores-dividend-yield',
    },
    faq: [
      {
        q: 'Qual a diferença entre proventos e dividendos?',
        a: 'Proventos é o termo amplo para todas as formas de remuneração ao acionista, e os dividendos são apenas uma delas. Além dos dividendos (lucro em dinheiro), os proventos incluem os juros sobre capital próprio, as bonificações em ações e os direitos de subscrição.',
      },
      {
        q: 'Todo provento paga imposto de renda?',
        a: 'Não. Os dividendos são isentos de imposto de renda para a pessoa física até R$ 50 mil por mês da mesma empresa (acima disso, desde 2026, há retenção de 10% sobre o total), enquanto os juros sobre capital próprio sofrem 17,5% de retenção na fonte. A bonificação em geral só gera imposto na venda futura das ações. As regras variam conforme o tipo de provento e a classe do ativo.',
      },
    ],
  },
  {
    slug: 'data-com',
    term: 'Data com',
    letter: 'D',
    seoTitle: 'O que é data com de dividendos',
    short:
      'Data com é o último pregão em que a compra ainda dá direito ao provento. A regra, um exemplo de calendário ilustrativo e o que essa data não decide.',
    body: [
      'A <strong>data com</strong> é o último pregão em que comprar a ação, a cota ou o fundo ainda dá direito ao <a href="/glossario/proventos">provento</a> anunciado. Quem está com o ativo no fechamento desse pregão entra na lista de quem recebe. A data de pagamento, o dia em que o dinheiro cai na conta, não muda essa lista. O mesmo calendário vale para <a href="/glossario/dividendos">dividendo</a>, <a href="/glossario/jscp">JCP</a> e rendimento de fundo imobiliário.',
      'A sequência de um anúncio tem quatro marcas: a data do anúncio, a data com, a <a href="/glossario/data-ex">data ex</a> (o pregão seguinte, já sem o direito) e a data de pagamento. Comprar durante a data com e carregar até o fechamento dá direito ao provento. Vender na data ex não tira o direito de quem estava posicionado no fechamento anterior. A <a href="/glossario/b3">B3</a> liquida o negócio em D+2, mas o direito ao provento é apurado pela data da negociação, não pela data da liquidação. A <a href="/dividendos/agenda">agenda de dividendos</a> mostra os pagamentos anunciados com essas datas.',
      '<strong>Exemplo ilustrativo:</strong> um comunicado hipotético marca a data com numa quarta-feira e a data ex na quinta-feira. Quem compra na quarta e segue até o fechamento entra na lista. Quem compra na quinta não entra. Quem vendeu na abertura da quinta, depois de ter fechado a quarta com o ativo, mantém o provento. Não há empresa, ticker, valor nem data real neste exemplo. É só a ordem dos pregões.',
      'Ressalva honesta: as limitações do calendário são estas. A data com decide o direito, não o valor que vai cair na conta nem se o anúncio ainda pode ser ajustado antes da assembleia. Entre a data com e o pagamento podem passar dias ou meses, e a assembleia pode fixar outro prazo, dentro do que a lei permite. Ter direito ao provento também não descreve se o ativo é adequado a alguém. A queda de preço na data ex é o ajuste do direito que saiu da cotação, assunto da página de data ex. Não é recomendação de compra ou venda.',
    ],
    related: ['data-ex', 'dividendos', 'jscp', 'proventos', 'dividend-yield'],
    backlink: {
      label: 'Ver a agenda de dividendos e as datas anunciadas',
      to: '/dividendos/agenda',
    },
    faq: [
      {
        q: 'Comprar na data com ainda dá direito ao provento?',
        a: 'Sim. A data com é o último pregão em que a compra, se for carregada até o fechamento, entra na lista de quem recebe o provento anunciado. Não é preciso ter o ativo há vários dias. A regra descreve o calendário. Não é recomendação de comprar nesse dia.',
      },
      {
        q: 'Vender na data ex faz perder o dividendo?',
        a: 'Não, se a posição existia no fechamento da data com. O direito já foi fixado. A venda na data ex transfere o ativo sem aquele provento, e o crédito segue programado para quem estava na lista.',
      },
      {
        q: 'Data com e data de pagamento são a mesma coisa?',
        a: 'Não. A data com decide quem tem direito. A data de pagamento é o dia em que o valor é creditado, e pode vir semanas ou meses depois. Estar na conta no dia do pagamento não cria direito para quem comprou depois da data com.',
      },
    ],
  },
  {
    slug: 'data-ex',
    term: 'Data ex',
    letter: 'D',
    seoTitle: 'O que é data ex (ex-dividendos)',
    short:
      'Data ex é o pregão em que o ativo negocia sem o provento. A conta do preço de referência, um exemplo ilustrativo e por que a queda do dia não é prejuízo.',
    body: [
      'A <strong>data ex</strong>, também chamada de ex-dividendos, é o pregão seguinte à <a href="/glossario/data-com">data com</a>. A partir dela o ativo passa a ser negociado sem o direito ao <a href="/glossario/proventos">provento</a> daquele anúncio. Quem compra na data ex não recebe aquele pagamento. Quem já tinha o ativo no fechamento da data com mantém o direito, mesmo se vender na data ex.',
      'O preço de referência costuma ser ajustado para baixo porque o direito saiu da cotação. A conta do ajuste teórico é <strong>preço de referência na data ex = fechamento da data com − provento bruto por ação</strong>. O pregão seguinte negocia a partir daí e pode fechar acima ou abaixo desse ponto, como em qualquer outro dia. Para quem já era dono, o que saiu do preço está programado para chegar em dinheiro na data de pagamento. Medir o retorno do dia sem somar o provento de volta lê a transferência como se fosse perda. A <a href="/dividendos/agenda">agenda de dividendos</a> publica as datas dos avisos.',
      '<strong>Exemplo ilustrativo:</strong> o fechamento hipotético da data com é R$ 30,00 e o provento anunciado é R$ 1,00 por ação. O preço de referência na data ex é R$ 29,00 (30 − 1). O real que saiu da cotação fica a receber. São números redondos para mostrar o ajuste. Não são cotação, provento nem dado real de nenhum ativo. O pregão do exemplo pode negociar a R$ 28,70 ou a R$ 29,40 sem que a fórmula mude.',
      'Ressalva honesta: as limitações do ajuste são concretas. A fórmula usa o provento bruto anunciado. No <a href="/glossario/jscp">JCP</a> o investidor recebe o líquido, depois de 17,5% retidos na fonte, e o preço de referência em geral desconta o bruto, não o líquido. Amortização de cota devolve capital e não é rendimento. <a href="/glossario/bonificacao">Bonificação</a> e <a href="/glossario/desdobramento">desdobramento</a> também têm data ex e ajustam o preço, sem depositar reais. A queda do dia ex não é, por si, notícia sobre o negócio. Não é recomendação de compra ou venda.',
    ],
    related: ['data-com', 'dividendos', 'jscp', 'proventos', 'dividend-yield'],
    backlink: {
      label: 'Ver a agenda de dividendos e a data ex dos avisos',
      to: '/dividendos/agenda',
    },
    faq: [
      {
        q: 'O que significa uma ação estar ex-dividendos?',
        a: 'Significa que ela está na data ex, ou depois dela, em relação a um provento já anunciado. Quem compra nessa condição não leva aquele provento. O direito ficou com quem tinha o ativo no fechamento da data com.',
      },
      {
        q: 'Por que o preço cai na data ex?',
        a: 'Porque o preço até a data com embutia o direito de receber aquele provento. Na data ex o direito sai, e o preço de referência é reduzido pelo valor bruto anunciado. A diferença fica programada como pagamento. O pregão pode negociar acima ou abaixo dessa referência.',
      },
      {
        q: 'A queda da data ex é prejuízo?',
        a: 'Para quem já tinha direito, a queda teórica do preço de referência é o provento trocando de forma: sai da cotação e vai para o pagamento. Comparar o preço de antes com o de depois, sem somar o provento, descreve mal o resultado do dia. O pregão ainda pode variar por outros motivos, como em qualquer sessão.',
      },
    ],
  },
  {
    slug: 'preco-teto-bazin',
    term: 'Preço teto de Bazin',
    letter: 'P',
    seoTitle: 'Método Bazin: o que é o preço teto',
    short:
      'O preço teto de Bazin divide os proventos de 12 meses por 6% ao ano. A fórmula, um exemplo ilustrativo e as limitações do método. Não é recomendação.',
    body: [
      'O <strong>preço teto de Bazin</strong> é o preço em que os proventos por ação dos últimos 12 meses ainda rendem o dividend yield mínimo que Décio Bazin adotou. No livro Faça Fortuna com Ações, publicado em 1992, esse piso é 6% ao ano. A conta inverte o <a href="/glossario/dividend-yield">dividend yield</a>: em vez de perguntar qual é o rendimento de um preço, pergunta qual preço produz 6%. É uma estimativa educacional. Não é recomendação de compra ou venda.',
      'A fórmula é <strong>preço teto = proventos por ação dos últimos 12 meses ÷ 0,06</strong>. O 0,06 é o 6% escrito em decimal. Trocar o percentual produz outra régua e deixa de ser o método de Bazin. Os proventos do numerador incluem o que foi distribuído em 12 meses. <a href="/glossario/jscp">JCP</a> bruto e líquido não são o mesmo número: usar o bruto no lugar do líquido aumenta o teto. O passo a passo das cinco fórmulas do site está no <a href="/guias/como-calcular-preco-teto">guia de como calcular preço teto</a>. A conta desta página roda na <a href="/calculadora/preco-teto/bazin">calculadora do método de Bazin</a> e também na <a href="/calculadora/preco-teto">calculadora de preço teto</a>.',
      '<strong>Exemplo ilustrativo:</strong> proventos hipotéticos de R$ 1,20 por ação nos últimos 12 meses, divididos por 0,06, dão preço teto de R$ 20,00 (1,20 ÷ 0,06). Sobre R$ 20,00, esses R$ 1,20 equivalem a 6% de dividend yield. São números redondos para fechar a divisão. Não são provento, cotação nem dado real de nenhum ativo.',
      'Ressalva honesta: as limitações do método estão no que a fórmula ignora. Ela olha os últimos 12 meses e não diz o que será distribuído depois. Ignora crescimento: uma empresa que reinveste o lucro e paga pouco sai com teto baixo ou zero, e isso não descreve o negócio. Ignora dívida: dois papéis com o mesmo provento recebem o mesmo teto. Um provento extraordinário entra na soma e eleva o resultado. O 6% é o piso do livro, escolhido num contexto de juros, não uma constante de mercado. A <a href="/glossario/graham">fórmula de Graham</a> usa lucro e patrimônio, não o dividendo, e as duas contas podem divergir.',
    ],
    related: ['dividend-yield', 'dividendos', 'jscp', 'graham', 'payout'],
    backlink: {
      label: 'Calcular o preço teto de Bazin com o yield de 6%',
      to: '/calculadora/preco-teto',
    },
    faq: [
      {
        q: 'O que é o método Bazin?',
        a: 'É a conta que divide os proventos por ação dos últimos 12 meses por 6% ao ano, o dividend yield mínimo que Décio Bazin usou em Faça Fortuna com Ações (1992). O resultado é um preço de referência. Não é previsão de cotação e não é recomendação.',
      },
      {
        q: 'Por que o método Bazin usa 6%?',
        a: 'Porque 6% ao ano é o piso de dividend yield que Bazin adotou naquele livro, no contexto de juros em que escreveu, para comparar renda variável com renda fixa. Não é uma lei de mercado. Outro percentual deixa de ser a régua clássica do método.',
      },
      {
        q: 'O preço teto de Bazin serve para FIIs?',
        a: 'A mesma divisão pode ser feita com o rendimento por cota dos últimos 12 meses. O resultado segue sendo uma estimativa educacional, com as mesmas limitações de olhar para trás e de não separar pagamento recorrente de pagamento único. Não escolhe fundo.',
      },
    ],
  },
  {
    slug: 'graham',
    term: 'Fórmula de Graham',
    letter: 'F',
    seoTitle: 'Fórmula de Graham: o que é e a conta',
    short:
      'A fórmula de Graham é a raiz de 22,5 vezes o lucro e o patrimônio por ação. A conta, um exemplo ilustrativo e os limites. Não é recomendação.',
    body: [
      'A <strong>fórmula de Graham</strong> estima um valor de referência com o lucro por ação e o valor patrimonial por ação. Benjamin Graham, em O Investidor Inteligente, propôs que o investidor defensivo não passasse de P/L 15 nem de <a href="/glossario/p-vp">P/VP</a> 1,5. O número 22,5 é o produto desses dois limites (15 × 1,5). A fórmula compacta os dois numa conta só. O resultado é educacional. Não é recomendação de compra ou venda e não ordena ativos.',
      'A fórmula é <strong>valor de referência = √(22,5 × LPA × VPA)</strong>. <a href="/glossario/lpa">LPA</a> é o lucro por ação. <a href="/glossario/vpa">VPA</a> é o patrimônio líquido por ação. A raiz faz com que um P/L acima de 15 possa conviver com um P/VP abaixo de 1,5, e o contrário, desde que o produto dos dois múltiplos não passe de 22,5. A conta exige LPA e VPA positivos: prejuízo zera o produto. A <a href="/calculadora/preco-teto/graham">página da fórmula de Graham</a> e a <a href="/calculadora/preco-teto">calculadora de preço teto</a> aplicam essa conta aos números informados. O <a href="/guias/como-calcular-preco-teto">guia de como calcular preço teto</a> compara a fórmula com as outras quatro.',
      '<strong>Exemplo ilustrativo:</strong> LPA de R$ 2,00 e VPA de R$ 20,00. O produto 22,5 × 2 × 20 é 900, e a raiz de 900 é R$ 30,00. Se alguém informa uma cotação de R$ 24,00 no mesmo exemplo, a distância até R$ 30,00 é de 20% ((30 − 24) ÷ 30). A distância é aritmética. Não descreve nenhum ativo, não é cotação real e não escolhe papel.',
      'Ressalva honesta: as limitações são as que o próprio critério carrega. A fórmula isolada ignora dívida: duas empresas com o mesmo LPA e o mesmo VPA recebem o mesmo número, ainda que uma deva muito e a outra tenha caixa. Ignora intangíveis: software, marca e serviço costumam ter VPA baixo em relação ao caixa que geram, e a conta fica sistematicamente abaixo. Graham tratava os múltiplos como triagem, junto de outros filtros de tamanho, solidez, histórico de lucro e de dividendos. Sem lucro positivo a fórmula não roda. Esta página explica a conta. Não publica lista de ativos ordenada por ela. O <a href="/glossario/preco-teto-bazin">método Bazin</a> usa o dividendo, não o LPA, e as duas réguas podem divergir.',
    ],
    related: ['p-vp', 'p-l', 'lpa', 'vpa', 'preco-teto-bazin'],
    backlink: {
      label: 'Calcular a fórmula de Graham na calculadora de preço teto',
      to: '/calculadora/preco-teto',
    },
    faq: [
      {
        q: 'De onde vem o 22,5 da fórmula de Graham?',
        a: 'É 15 multiplicado por 1,5. No critério de Graham para o investidor defensivo, 15 é o teto de P/L e 1,5 é o teto de P/VP. A raiz de 22,5 × LPA × VPA é uma forma compacta de escrever o preço em que o produto desses dois múltiplos chega a 22,5.',
      },
      {
        q: 'A fórmula de Graham funciona com prejuízo?',
        a: 'Não. LPA negativo zera ou inviabiliza o produto debaixo da raiz. A fórmula se recusa a produzir um número quando não há lucro por ação positivo. Isso é um limite do método, não um veredito sobre a empresa.',
      },
      {
        q: 'O resultado da fórmula é uma recomendação?',
        a: 'Não. O número é uma estimativa educacional feita com LPA, VPA e a constante 22,5. Não escolhe ativo, não ordena uma lista e não é preço-alvo. A distância entre uma cotação informada e o resultado é só a conta.',
      },
    ],
  },
]

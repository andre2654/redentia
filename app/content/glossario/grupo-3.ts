import type { GlossaryTerm } from '~/types/glossario'

/**
 * Grupo 3 do glossário. Ver grupo-1 (exemplar dividend-yield) pro padrão de
 * qualidade: definição correta e neutra, internal linking no corpo, 1 backlink
 * forte pra rota real, related só com slugs que existem, exemplos numéricos
 * sempre marcados "Exemplo ilustrativo:". Zero cotação/DY/ticker inventado.
 */
export const GRUPO_3: GlossaryTerm[] = [
  {
    slug: 'fundos-tijolo',
    term: 'Fundos de Tijolo',
    letter: 'F',
    short:
      'Fundos de Tijolo são FIIs que investem em imóveis físicos, como galpões logísticos, shoppings e lajes corporativas, e distribuem aos cotistas a renda gerada pelos aluguéis.',
    body: [
      'Os <strong>Fundos de Tijolo</strong> são a categoria mais tradicional de <a href="/glossario/fii">FIIs</a>: em vez de papéis, eles compram imóveis reais e vivem do aluguel que esses imóveis geram. Galpões logísticos, lajes corporativas, shopping centers, hospitais e agências bancárias são os tipos mais comuns de ativo dentro de um fundo de tijolo.',
      'A lógica é a de um proprietário profissional. O fundo aluga os imóveis, recebe os contratos, desconta os custos de manutenção e repassa o resultado aos cotistas na forma de <a href="/glossario/dividendos">dividendos</a> mensais. Como boa parte dos contratos é de longo prazo e reajustada por índices de inflação, a renda tende a ser mais estável e previsível do que a de fundos que vivem de juros.',
      'Na análise, três números concentram a atenção: a <a href="/glossario/vacancia">vacância</a> (quanto do imóvel está vazio), o <a href="/glossario/cap-rate">cap rate</a> (o retorno do aluguel sobre o valor do imóvel) e a relação entre o preço da cota e o valor patrimonial. Um fundo de tijolo com vacância baixa, inquilinos sólidos e boa localização costuma sustentar melhor a distribuição ao longo do tempo.',
      'Ressalva honesta: imóvel físico não é imune a risco. Vacância prolongada, inadimplência de inquilinos, obras e desvalorização do imóvel derrubam o rendimento, e a cota pode ser negociada abaixo do valor patrimonial por longos períodos. Fundo de tijolo é renda imobiliária real, não renda fixa. Compare os fundos disponíveis no <a href="/rankings?classe=fiis">ranking de FIIs</a> antes de escolher.',
    ],
    related: ['fii', 'fundos-papel', 'vacancia', 'cap-rate', 'noi'],
    backlink: {
      label: 'Ver e comparar os FIIs no ranking',
      to: '/rankings?classe=fiis',
    },
    faq: [
      {
        q: 'Qual a diferença entre fundo de tijolo e fundo de papel?',
        a: 'O fundo de tijolo é dono de imóveis físicos e vive do aluguel; o fundo de papel investe em títulos de dívida imobiliária, como CRIs, e vive dos juros desses papéis. Tijolo tende a ser mais estável e ligado ao ciclo dos imóveis; papel costuma ter yield inicial maior e é mais sensível a juros e inflação.',
      },
      {
        q: 'Fundo de tijolo é um bom investimento para renda?',
        a: 'Pode ser, para quem busca renda mensal ligada a aluguéis reais e aceita a oscilação do preço da cota. O ponto central é a qualidade dos imóveis e dos inquilinos e o nível de vacância, não apenas o dividend yield do momento.',
      },
      {
        q: 'Fundo de tijolo protege da inflação?',
        a: 'Em parte. Muitos contratos de aluguel são reajustados por índices de inflação, o que ajuda a preservar a renda em termos reais, mas isso não garante o preço da cota nem elimina o risco de vacância.',
      },
    ],
  },
  {
    slug: 'fundos-papel',
    term: 'Fundos de Papel',
    letter: 'F',
    short:
      'Fundos de Papel são FIIs que investem em títulos de dívida do setor imobiliário, como CRIs, em vez de imóveis físicos, e distribuem os juros desses papéis aos cotistas.',
    body: [
      'Os <strong>Fundos de Papel</strong> são <a href="/glossario/fii">FIIs</a> que não possuem imóveis. Em vez de comprar galpões ou lajes, eles compram títulos de crédito do setor imobiliário, principalmente <a href="/glossario/cri">CRIs</a> (Certificados de Recebíveis Imobiliários), e recebem os juros desses papéis, que são repassados aos cotistas.',
      'Na prática, um fundo de papel funciona como uma carteira de renda fixa imobiliária. Seus rendimentos costumam estar atrelados ao <a href="/glossario/cdi">CDI</a> ou ao <a href="/glossario/ipca">IPCA</a> mais uma taxa, o que faz o fundo se comportar de forma bem diferente de um <a href="/glossario/fundos-tijolo">fundo de tijolo</a>: ele não sofre com vacância física, mas sente diretamente o movimento dos juros e da inflação.',
      'O dividend yield inicial de um fundo de papel costuma parecer mais alto que o de um fundo de tijolo, porque reflete a taxa dos títulos em carteira. Por isso a análise se concentra em dois riscos: a qualidade de crédito dos devedores (o risco de calote nos CRIs) e a marcação a mercado, que faz o preço da cota oscilar quando os juros mudam.',
      'Ressalva honesta: yield alto não é almoço grátis. Fundos de papel carregam risco de crédito real e podem sofrer perdas se os devedores não pagarem ou se a inflação e os juros virarem contra a carteira. Vale entender a composição antes de olhar só o rendimento. Explore os fundos no <a href="/rankings?classe=fiis">ranking de FIIs</a>.',
    ],
    related: ['fii', 'fundos-tijolo', 'cri', 'lci-lca', 'dividend-yield'],
    backlink: {
      label: 'Ver e comparar os FIIs no ranking',
      to: '/rankings?classe=fiis',
    },
    faq: [
      {
        q: 'Fundo de papel é renda fixa?',
        a: 'Não exatamente. Ele investe em títulos de crédito imobiliário, que se parecem com renda fixa, mas a cota é negociada em bolsa e sofre marcação a mercado. Ou seja, o preço oscila e não há a previsibilidade de um título carregado até o vencimento.',
      },
      {
        q: 'Por que o dividend yield dos fundos de papel costuma ser mais alto?',
        a: 'Porque o rendimento reflete a taxa dos CRIs em carteira, geralmente CDI ou IPCA mais um spread. Esse yield maior vem acompanhado de risco de crédito e de sensibilidade a juros, que não aparecem no número isolado.',
      },
      {
        q: 'Qual o principal risco de um fundo de papel?',
        a: 'O risco de crédito: se os devedores dos CRIs não honrarem as dívidas, o fundo perde rendimento e valor patrimonial. Somado a isso, mudanças na inflação e nos juros alteram a marcação a mercado e o preço da cota.',
      },
    ],
  },
  {
    slug: 'tesouro-direto',
    term: 'Tesouro Direto',
    letter: 'T',
    short:
      'Tesouro Direto é o programa do governo federal que permite à pessoa física comprar títulos públicos pela internet, emprestando dinheiro ao Tesouro Nacional em troca de juros.',
    body: [
      'O <strong>Tesouro Direto</strong> é um programa do Tesouro Nacional, em parceria com a <a href="/glossario/b3">B3</a>, que permite a qualquer pessoa comprar títulos públicos federais com poucos reais e pela internet. Na prática, você empresta dinheiro ao governo e recebe juros por isso, com o menor risco de crédito disponível no país, o chamado risco soberano.',
      'Há três famílias de títulos, cada uma com um objetivo. O <a href="/glossario/tesouro-selic">Tesouro Selic</a> é pós-fixado e acompanha a <a href="/glossario/selic">Selic</a>, ideal para reserva. O <a href="/glossario/tesouro-ipca">Tesouro IPCA+</a> paga inflação mais um juro real, para proteger o poder de compra no longo prazo. E o Tesouro Prefixado trava uma taxa fixa conhecida no momento da compra.',
      'Os custos são enxutos: uma taxa de custódia da B3 sobre o valor investido e o Imposto de Renda regressivo, que cai conforme o tempo de aplicação, indo da faixa mais alta para a mais baixa depois de dois anos. A liquidez é diária, então dá para vender antes do vencimento, mas aí entra a marcação a mercado.',
      'Ressalva honesta: seguro contra calote não significa preço fixo. Se você vender um título prefixado ou IPCA+ antes do vencimento e os juros tiverem subido, pode resgatar por menos do que pagou. A garantia de receber a taxa contratada vale para quem carrega o título até o fim. Compare as opções no <a href="/ranking/tesouro-direto">ranking do Tesouro Direto</a>.',
    ],
    related: ['tesouro-selic', 'tesouro-ipca', 'selic', 'ipca', 'cdb'],
    backlink: {
      label: 'Ver o ranking dos títulos do Tesouro Direto',
      to: '/ranking/tesouro-direto',
    },
    faq: [
      {
        q: 'O Tesouro Direto é seguro?',
        a: 'É o investimento de menor risco de crédito do Brasil, porque quem paga é o governo federal (risco soberano). Isso não elimina a oscilação de preço dos títulos prefixados e IPCA+ quando vendidos antes do vencimento, por causa da marcação a mercado.',
      },
      {
        q: 'Qual título do Tesouro escolher?',
        a: 'Depende do objetivo: Tesouro Selic para reserva de emergência e liquidez, Tesouro IPCA+ para proteger o poder de compra no longo prazo e Tesouro Prefixado para travar uma taxa quando você acredita que os juros vão cair.',
      },
      {
        q: 'Preciso pagar imposto no Tesouro Direto?',
        a: 'Sim. Há Imposto de Renda regressivo sobre o rendimento, que começa mais alto para prazos curtos e cai para a menor faixa após dois anos, além da taxa de custódia da B3. A poupança é isenta, mas costuma render menos.',
      },
    ],
  },
  {
    slug: 'cdi',
    term: 'CDI',
    letter: 'C',
    short:
      'CDI é a taxa dos empréstimos de curtíssimo prazo entre bancos e funciona como a principal referência de rentabilidade da renda fixa brasileira.',
    body: [
      'O <strong>CDI</strong> (Certificado de Depósito Interbancário) é a taxa que os bancos cobram entre si em empréstimos de um dia, calculada e divulgada diariamente pela <a href="/glossario/b3">B3</a>. Sozinho ele não é um investimento; é uma régua. Quando um CDB ou fundo diz que rende um percentual do CDI, é a essa taxa que ele se refere.',
      'O CDI anda praticamente colado na <a href="/glossario/selic">Selic</a>, ficando poucos centésimos abaixo dela. Por isso, quando o Banco Central mexe na Selic, o CDI acompanha, e toda a renda fixa pós-fixada, de <a href="/glossario/cdb">CDBs</a> a <a href="/glossario/tesouro-selic">Tesouro Selic</a>, se move junto.',
      'Na prática, o CDI serve para duas coisas: precificar produtos (um CDB de "110% do CDI" paga 10% a mais que a taxa) e servir de <a href="/glossario/benchmark">benchmark</a>. Bater o CDI é a linha de corte mínima da renda fixa; um investimento que rende menos que o CDI está entregando abaixo do custo do dinheiro seguro no Brasil.',
      '<strong>Exemplo ilustrativo:</strong> um CDB que paga 110% do CDI num período em que o CDI acumulou 10% renderia cerca de 11% bruto (110% de 10%), antes do Imposto de Renda. São números redondos só para mostrar a mecânica, não uma taxa real. Simule cenários na <a href="/calculadora/juros-compostos">calculadora de juros compostos</a>.',
    ],
    related: ['selic', 'cdb', 'tesouro-selic', 'benchmark'],
    backlink: {
      label: 'Simular quanto rende um percentual do CDI ao longo do tempo',
      to: '/calculadora/juros-compostos',
    },
    faq: [
      {
        q: 'Qual a diferença entre CDI e Selic?',
        a: 'A Selic é a taxa básica definida pelo Banco Central; o CDI é a taxa de mercado dos empréstimos de um dia entre bancos. Na prática são quase iguais, com o CDI ficando poucos centésimos abaixo da Selic.',
      },
      {
        q: 'O que significa render 100% do CDI?',
        a: 'Significa que o investimento entrega exatamente a variação do CDI no período. Render 110% do CDI é entregar 10% acima dessa taxa; render 90% é ficar 10% abaixo dela.',
      },
      {
        q: 'Render menos que o CDI é ruim?',
        a: 'Para renda fixa conservadora, costuma ser um mau sinal, porque o CDI é a referência do dinheiro de baixo risco. Em investimentos de risco, como ações, faz mais sentido comparar com outros indicadores, e não com o CDI.',
      },
    ],
  },
  {
    slug: 'selic',
    term: 'Selic',
    letter: 'S',
    short:
      'Selic é a taxa básica de juros da economia brasileira, definida pelo Banco Central, e serve de referência para todos os outros juros e investimentos do país.',
    body: [
      'A <strong>Selic</strong> é a taxa básica de juros do Brasil, definida a cada reunião do <a href="/glossario/copom">Copom</a>, o comitê de política monetária do Banco Central. Ela é o piso a partir do qual todo o resto se organiza: o custo do crédito, o rendimento da renda fixa e, indiretamente, o preço das ações.',
      'O Banco Central usa a Selic para controlar a <a href="/glossario/inflacao">inflação</a>. Quando os preços aceleram, ele sobe a Selic para encarecer o crédito e esfriar o consumo; quando a economia esfria demais, corta a taxa para estimular. É por isso que acompanhar o ciclo da Selic ajuda a entender para onde caminham os investimentos.',
      'O efeito sobre a carteira é direto. Selic alta valoriza a renda fixa e o <a href="/glossario/tesouro-selic">Tesouro Selic</a>, que a acompanha, e costuma pressionar ações e <a href="/glossario/fii">FIIs</a>, porque o dinheiro migra para o que é seguro. Selic baixa faz o caminho inverso, tornando os ativos de risco relativamente mais atraentes.',
      'Ressalva honesta: a Selic não é destino, é ciclo. Ela sobe e desce conforme a inflação e a atividade econômica, e tentar acertar cada movimento é difícil até para profissionais. Para o investidor de longo prazo, importa mais entender em que fase do ciclo estamos do que prever a próxima decisão. Veja os títulos atrelados à Selic no <a href="/tesouro">Tesouro</a>.',
    ],
    related: ['cdi', 'tesouro-selic', 'copom', 'inflacao', 'ipca'],
    backlink: {
      label: 'Ver os títulos do Tesouro atrelados à Selic',
      to: '/tesouro',
    },
    faq: [
      {
        q: 'O que é a taxa Selic?',
        a: 'É a taxa básica de juros da economia brasileira, definida pelo Copom em reuniões periódicas. Ela serve de referência para o custo do crédito e para a rentabilidade da renda fixa no país.',
      },
      {
        q: 'Como a Selic afeta meus investimentos?',
        a: 'Selic alta tende a favorecer a renda fixa e pressionar ações e FIIs, porque o retorno seguro fica mais atraente. Selic baixa costuma fazer o contrário, valorizando os ativos de risco. O Tesouro Selic acompanha a taxa quase em tempo real.',
      },
      {
        q: 'Quem define a Selic?',
        a: 'O Copom, comitê de política monetária do Banco Central. A decisão é tomada em reuniões periódicas e leva em conta principalmente a inflação e o ritmo da atividade econômica.',
      },
    ],
  },
  {
    slug: 'ev-ebitda',
    term: 'EV/EBITDA',
    letter: 'E',
    short:
      'EV/EBITDA compara o valor total da empresa (Enterprise Value) com o EBITDA, sendo um dos múltiplos de valuation preferidos por analistas por ignorar dívida, impostos e depreciação.',
    body: [
      'O <strong>EV/EBITDA</strong> relaciona o <a href="/glossario/enterprise-value">Enterprise Value</a>, o valor total da empresa somando ações e dívida líquida, com o <a href="/glossario/ebitda">EBITDA</a>, o resultado operacional antes de juros, impostos e depreciação. É um dos múltiplos favoritos de analistas justamente porque olha a operação isolada da estrutura de capital.',
      'A grande vantagem sobre o <a href="/glossario/p-l">P/L</a> é a neutralidade em relação à dívida. Duas empresas iguais na operação, mas com endividamentos diferentes, teriam P/L distintos; no EV/EBITDA elas ficam mais comparáveis, porque a dívida já está embutida no numerador. Isso torna o indicador útil também para comparar empresas de países e regimes tributários diferentes.',
      'A leitura é a de um múltiplo: quanto menor, mais barata a empresa tende a estar em relação à sua geração operacional de caixa. Mas o número certo varia muito por setor, então a comparação honesta é sempre contra os pares do mesmo segmento e contra o histórico da própria empresa, nunca um valor mágico universal.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa com EV de R$ 5 bilhões e EBITDA de R$ 500 milhões tem EV/EBITDA de 10x, ou seja, o mercado paga dez vezes a geração operacional anual. Números redondos apenas para mostrar a conta. Monte comparações de múltiplos no <a href="/rankings">screener de ações</a>.',
    ],
    related: ['ev-ebit', 'ebitda', 'enterprise-value', 'p-ebitda', 'divida-liquida-ebitda'],
    backlink: {
      label: 'Filtrar e comparar ações por múltiplos no screener',
      to: '/rankings',
    },
    faq: [
      {
        q: 'O que é um bom EV/EBITDA?',
        a: 'Não existe um número universal: um EV/EBITDA considerado barato em um setor pode ser caro em outro. O certo é comparar a empresa com os pares do mesmo segmento e com o próprio histórico, lembrando que múltiplos baixos às vezes escondem problemas.',
      },
      {
        q: 'Por que usar EV/EBITDA em vez de P/L?',
        a: 'Porque o EV/EBITDA neutraliza o efeito do endividamento e da estrutura de capital, comparando as empresas pela operação pura. O P/L é influenciado por juros, impostos e depreciação, o que distorce a comparação entre empresas com dívidas diferentes.',
      },
      {
        q: 'EV/EBITDA baixo significa ação barata?',
        a: 'Pode significar, mas não sozinho. Um múltiplo baixo tanto reflete uma boa oportunidade quanto sinaliza risco, baixo crescimento ou problemas na empresa. Ele precisa ser lido junto de endividamento, margens e qualidade do negócio.',
      },
    ],
  },
  {
    slug: 'p-ebitda',
    term: 'P/EBITDA',
    letter: 'P',
    short:
      'P/EBITDA relaciona o valor de mercado da empresa com o EBITDA, funcionando como um primo do P/L que troca o lucro líquido pela geração operacional.',
    body: [
      'O <strong>P/EBITDA</strong> compara o <a href="/glossario/valor-mercado">valor de mercado</a> da empresa (o preço de todas as ações) com o seu <a href="/glossario/ebitda">EBITDA</a>. É, na essência, um primo do <a href="/glossario/p-l">P/L</a>: em vez de dividir o preço pelo lucro líquido, divide pela geração operacional antes de juros, impostos e depreciação.',
      'A diferença crucial em relação ao <a href="/glossario/ev-ebitda">EV/EBITDA</a> é que o P/EBITDA usa apenas o valor das ações, ignorando a dívida. Por isso ele faz mais sentido em empresas com endividamento baixo; onde há muita dívida, o EV/EBITDA descreve melhor a realidade, porque incorpora o que a empresa deve.',
      'A leitura segue a lógica de qualquer múltiplo: quanto menor, mais barata a empresa em relação ao seu resultado operacional. Como o EBITDA costuma ser mais estável que o lucro líquido (que sofre com itens não recorrentes e efeitos financeiros), o P/EBITDA tende a variar menos que o P/L de um período para outro.',
      'Ressalva honesta: EBITDA não é caixa. Ele ignora investimentos, juros e a necessidade de capital de giro, então uma empresa pode parecer barata no P/EBITDA e ainda assim consumir caixa. Use o indicador junto de endividamento e margens. Compare ações por múltiplos no <a href="/rankings">screener</a>.',
    ],
    related: ['p-l', 'ev-ebitda', 'ebitda', 'valor-mercado'],
    backlink: {
      label: 'Comparar ações por múltiplos no screener',
      to: '/rankings',
    },
    faq: [
      {
        q: 'Qual a diferença entre P/EBITDA e EV/EBITDA?',
        a: 'O P/EBITDA usa só o valor de mercado das ações; o EV/EBITDA usa o Enterprise Value, que soma a dívida líquida. Em empresas endividadas, o EV/EBITDA é mais fiel; em empresas com pouca dívida, os dois se aproximam.',
      },
      {
        q: 'Por que o P/EBITDA é mais estável que o P/L?',
        a: 'Porque o EBITDA exclui itens que oscilam muito no lucro líquido, como despesas financeiras, impostos e efeitos não recorrentes. Isso deixa o múltiplo menos sujeito a distorções de um trimestre para outro.',
      },
      {
        q: 'P/EBITDA baixo é sinal de oportunidade?',
        a: 'Nem sempre. Um múltiplo baixo pode indicar preço atrativo ou refletir risco, endividamento e baixo crescimento. Ele deve ser lido no contexto do setor e junto de outros indicadores.',
      },
    ],
  },
  {
    slug: 'p-ebit',
    term: 'P/EBIT',
    letter: 'P',
    short:
      'P/EBIT relaciona o valor da empresa com o EBIT, o lucro operacional, mostrando quantos anos de resultado operacional seriam necessários para pagar o preço atual.',
    body: [
      'O <strong>P/EBIT</strong> divide o valor da empresa pelo <a href="/glossario/ebit">EBIT</a>, o lucro operacional, também chamado de lucro antes de juros e impostos. É uma variação do <a href="/glossario/p-l">P/L</a> que troca o lucro líquido pelo resultado da operação, antes de o resultado financeiro e os tributos entrarem na conta.',
      'A vantagem é isolar o desempenho operacional. Ao remover o efeito de juros e impostos, o P/EBIT permite comparar empresas com estruturas de capital diferentes de forma mais justa, algo que o P/L nem sempre consegue quando uma empresa é muito endividada e a outra não.',
      'A diferença para o <a href="/glossario/ev-ebit">EV/EBIT</a> é a mesma que separa o P/EBITDA do EV/EBITDA: o P/EBIT olha só as ações, enquanto o EV/EBIT incorpora a dívida líquida. Quando há endividamento relevante, a versão com Enterprise Value costuma ser a mais informativa.',
      'Ressalva honesta: diferente do EBITDA, o EBIT já desconta a depreciação, o que o aproxima da realidade de negócios que investem pesado em ativos. Ainda assim, é um múltiplo, e múltiplo se lê contra os pares e o histórico, nunca isolado. Filtre ações baratas por lucro no <a href="/ranking/menores-pl">ranking de menores P/L</a>.',
    ],
    related: ['p-l', 'ev-ebit', 'ebit', 'p-ebitda'],
    backlink: {
      label: 'Ver as ações com menores múltiplos de lucro',
      to: '/ranking/menores-pl',
    },
    faq: [
      {
        q: 'Qual a diferença entre P/EBIT e P/L?',
        a: 'O P/L usa o lucro líquido, que já sofreu o impacto de juros e impostos; o P/EBIT usa o lucro operacional, antes desses efeitos. Por isso o P/EBIT compara melhor empresas com níveis de endividamento diferentes.',
      },
      {
        q: 'P/EBIT ou EV/EBIT: qual usar?',
        a: 'Para empresas com dívida relevante, o EV/EBIT costuma ser mais fiel, porque incorpora o endividamento no valor. O P/EBIT funciona melhor em empresas pouco endividadas, onde a dívida quase não altera a conta.',
      },
      {
        q: 'O que é um bom P/EBIT?',
        a: 'Depende do setor e do crescimento esperado. Como qualquer múltiplo, um P/EBIT baixo pode ser oportunidade ou armadilha; ele só faz sentido comparado aos pares do mesmo segmento e ao histórico da empresa.',
      },
    ],
  },
  {
    slug: 'psr',
    term: 'PSR',
    letter: 'P',
    short:
      'PSR (Price to Sales Ratio) relaciona o valor de mercado da empresa com a receita, sendo útil para avaliar companhias em crescimento que ainda não geram lucro.',
    body: [
      'O <strong>PSR</strong> (Price to Sales Ratio, ou preço sobre vendas) mede quanto o mercado paga por cada real de receita da empresa. É o <a href="/glossario/valor-mercado">valor de mercado</a> dividido pela receita anual, um múltiplo especialmente útil quando o <a href="/glossario/p-l">P/L</a> não serve, por exemplo em empresas que ainda não têm lucro.',
      'A grande vantagem do PSR é a robustez do denominador. A receita é muito mais difícil de manipular do que o lucro, que pode ser distorcido por itens contábeis e não recorrentes. Por isso o indicador é comum na análise de empresas de tecnologia, startups e companhias em recuperação, que faturam bem mas ainda não convertem isso em lucro.',
      'O ponto cego é justamente a rentabilidade. O PSR não diz nada sobre margem: uma empresa pode ter receita enorme e prejuízo, e o múltiplo continuaria baixo. Por isso ele quase nunca é usado sozinho, e sim ao lado da <a href="/glossario/margem-liquida">margem líquida</a>, para separar receita lucrativa de receita que só queima caixa.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa que vale R$ 10 bilhões e fatura R$ 5 bilhões por ano tem PSR de 2, ou seja, o mercado paga duas vezes a receita anual. Números redondos apenas para mostrar a conta. Veja quem converte receita em lucro no <a href="/ranking/maiores-margem-liquida">ranking de maiores margens líquidas</a>.',
    ],
    related: ['p-l', 'margem-liquida', 'valor-mercado', 'p-vp'],
    backlink: {
      label: 'Ver as empresas com maiores margens líquidas',
      to: '/ranking/maiores-margem-liquida',
    },
    faq: [
      {
        q: 'Para que serve o PSR?',
        a: 'Serve para avaliar empresas pelo faturamento quando o lucro não é um bom termômetro, como em companhias em forte crescimento ou em prejuízo temporário. Ele indica quanto o mercado paga por cada real de receita.',
      },
      {
        q: 'PSR baixo significa ação barata?',
        a: 'Não necessariamente. Um PSR baixo pode indicar oportunidade ou refletir margens ruins e prejuízo. Como o indicador ignora a rentabilidade, ele precisa ser lido junto das margens da empresa.',
      },
      {
        q: 'Qual a diferença entre PSR e P/L?',
        a: 'O P/L compara preço e lucro; o PSR compara preço e receita. O PSR funciona mesmo quando não há lucro, mas em compensação não captura a rentabilidade, algo que o P/L reflete.',
      },
    ],
  },
  {
    slug: 'divida-liquida-ebitda',
    term: 'Dívida Líquida/EBITDA',
    letter: 'D',
    short:
      'Dívida Líquida/EBITDA mede o endividamento da empresa indicando quantos anos de geração operacional seriam necessários para quitar a dívida líquida.',
    body: [
      'O indicador <strong>Dívida Líquida/EBITDA</strong> é um dos termômetros mais usados de saúde financeira. Ele divide a dívida líquida (a dívida total menos o caixa e as aplicações) pelo <a href="/glossario/ebitda">EBITDA</a> anual, respondendo a uma pergunta simples: quantos anos de geração operacional a empresa levaria para pagar o que deve.',
      'A leitura é intuitiva, e quanto menor, mais folgada a empresa. Um resultado abaixo de uma vez costuma indicar endividamento conservador; entre uma e duas vezes, uma situação saudável; acima de três vezes, começa o sinal de alerta, porque a dívida passa a consumir boa parte do caixa gerado e deixa a empresa vulnerável a solavancos.',
      'O nível aceitável muda muito com o setor. Empresas de infraestrutura e utilities, com receitas estáveis e previsíveis, convivem bem com múltiplos mais altos; negócios cíclicos ou de baixa previsibilidade precisam de bem mais folga. Por isso o indicador anda junto do estudo de <a href="/glossario/alavancagem">alavancagem</a> e da qualidade da geração de caixa.',
      'Ressalva honesta: em empresas cíclicas, o número engana se calculado na hora errada. Um EBITDA inflado no topo do ciclo faz a dívida parecer baixa; quando o ciclo vira, a mesma dívida vira um problema. O ideal é olhar a razão em anos de EBITDA normalizado. Avalie a solidez das empresas no <a href="/ranking/redentia-score">ranking do Redentia Score</a>.',
    ],
    related: ['ebitda', 'alavancagem', 'ev-ebitda', 'roic'],
    backlink: {
      label: 'Avaliar a solidez das empresas pelo Redentia Score',
      to: '/ranking/redentia-score',
    },
    faq: [
      {
        q: 'Qual é um nível saudável de Dívida Líquida/EBITDA?',
        a: 'Como regra geral, abaixo de duas vezes costuma ser confortável e acima de três vezes acende o alerta, mas o nível aceitável depende muito do setor. Empresas de receita estável suportam mais dívida que negócios cíclicos.',
      },
      {
        q: 'O que significa Dívida Líquida/EBITDA negativo?',
        a: 'Significa que a empresa tem mais caixa e aplicações do que dívida, ou seja, um caixa líquido. É um sinal de conservadorismo financeiro, embora caixa parado em excesso também possa indicar falta de oportunidades de investimento.',
      },
      {
        q: 'Por que esse indicador engana em empresas cíclicas?',
        a: 'Porque o EBITDA de empresas cíclicas oscila bastante. Calculado no topo do ciclo, o resultado parece baixo e a empresa parece saudável; quando o ciclo vira e o EBITDA cai, a mesma dívida se torna muito mais pesada.',
      },
    ],
  },
  {
    slug: 'acoes-on-pn',
    term: 'Ações ON e PN',
    letter: 'A',
    short:
      'Ações ON (ordinárias) dão direito a voto, enquanto ações PN (preferenciais) têm preferência no recebimento de dividendos mas em geral não votam.',
    body: [
      'No mercado brasileiro, uma mesma empresa pode ter dois tipos de ação. As <strong>ordinárias (ON)</strong>, com final 3 no ticker, dão direito a voto nas assembleias. As <strong>preferenciais (PN)</strong>, com final 4, em geral não votam, mas têm prioridade no recebimento de <a href="/glossario/dividendos">dividendos</a> e, às vezes, dividendo mínimo garantido.',
      'A escolha entre uma e outra depende do perfil. Para o grande investidor interessado em controle e voto, a ON importa. Para o investidor pessoa física focado em renda, a PN costuma ser mais prática, porque tende a ser mais líquida e negociada, e o direito a voto raramente faz diferença no dia a dia.',
      'Há duas nuances importantes. A primeira é o <a href="/glossario/tag-along">tag along</a>: em geral a ON garante melhor proteção ao minoritário numa venda de controle, enquanto a PN nem sempre tem esse direito. A segunda é o <a href="/glossario/novo-mercado">Novo Mercado</a>, o nível de governança da B3 que só admite ações ON, eliminando essa distinção nas empresas listadas nele.',
      'Ressalva honesta: nem sempre a PN é a melhor. O direito de voto, o tag along e a diferença de preço entre as classes mudam de empresa para empresa, e vale checar o estatuto antes de decidir. Explore as maiores pagadoras de proventos no <a href="/ranking/maiores-dividend-yield">ranking de dividend yield</a>.',
    ],
    related: ['tag-along', 'novo-mercado', 'free-float', 'dividendos'],
    backlink: {
      label: 'Ver as ações com maiores dividend yields',
      to: '/ranking/maiores-dividend-yield',
    },
    faq: [
      {
        q: 'Como diferenciar ação ON de PN pelo ticker?',
        a: 'Pelo número final: ON termina em 3 e PN termina em 4. Assim, na mesma empresa, o papel com final 3 é ordinário (com voto) e o com final 4 é preferencial (com prioridade em dividendos).',
      },
      {
        q: 'É melhor comprar ON ou PN?',
        a: 'Depende do objetivo. Quem busca renda e liquidez costuma preferir a PN; quem valoriza voto e proteção em venda de controle tende a olhar a ON. Vale comparar preço, liquidez e tag along de cada classe.',
      },
      {
        q: 'Por que empresas do Novo Mercado só têm ON?',
        a: 'Porque o Novo Mercado é o nível mais alto de governança da B3 e exige uma única classe de ações com direito a voto, além de tag along de 100%. Isso simplifica a estrutura e reforça os direitos dos minoritários.',
      },
    ],
  },
  {
    slug: 'free-float',
    term: 'Free Float',
    letter: 'F',
    short:
      'Free float é a fração das ações de uma empresa que está efetivamente disponível para negociação no mercado, excluindo as posições de controladores e estratégicos.',
    body: [
      'O <strong>free float</strong> é o percentual das ações de uma empresa que circula livremente na bolsa, disponível para qualquer investidor comprar e vender. Ficam de fora as ações do controlador, de investidores estratégicos, as mantidas em tesouraria e as bloqueadas por acordos de lock-up.',
      'O free float é um dos principais motores da <a href="/glossario/liquidez">liquidez</a>. Quanto maior a fatia em circulação, mais fácil negociar sem mexer no preço; quanto menor, mais difícil entrar e sair, e maior tende a ser a <a href="/glossario/volatilidade">volatilidade</a>, já que poucas ações precisam absorver cada ordem de compra ou venda.',
      'É também um requisito de governança. O <a href="/glossario/novo-mercado">Novo Mercado</a> da B3 exige um free float mínimo, justamente para garantir que haja ações suficientes em mercado e proteger o investidor comum. Um float muito baixo, além de dificultar a negociação, concentra poder nas mãos do controlador.',
      'Ressalva honesta: free float alto ajuda na liquidez, mas não é garantia de bom investimento. Uma empresa pode ter muitas ações em circulação e ainda assim ser um negócio ruim. Ele é um filtro de negociabilidade, não de qualidade. Veja as empresas mais líquidas e negociadas no <a href="/ranking/maiores-valor-mercado">ranking por valor de mercado</a>.',
    ],
    related: ['liquidez', 'novo-mercado', 'volatilidade', 'valor-mercado'],
    backlink: {
      label: 'Explorar as maiores empresas da bolsa por valor de mercado',
      to: '/ranking/maiores-valor-mercado',
    },
    faq: [
      {
        q: 'O que é considerado um bom free float?',
        a: 'Não há um número mágico, mas floats muito baixos, na casa de um dígito, costumam trazer pouca liquidez e mais volatilidade. Faixas mais altas facilitam a negociação. O Novo Mercado exige um mínimo justamente para assegurar circulação.',
      },
      {
        q: 'Por que o free float afeta a liquidez?',
        a: 'Porque só as ações em circulação absorvem as ordens do mercado. Com poucas disponíveis, cada compra ou venda mexe mais no preço, tornando o papel mais volátil e difícil de negociar em quantidade.',
      },
      {
        q: 'Ações do controlador entram no free float?',
        a: 'Não. O free float exclui as posições de controladores, investidores estratégicos, ações em tesouraria e papéis bloqueados. Ele mede apenas o que realmente está disponível para o público negociar.',
      },
    ],
  },
  {
    slug: 'novo-mercado',
    term: 'Novo Mercado',
    letter: 'N',
    short:
      'Novo Mercado é o mais alto segmento de governança corporativa da B3, com regras rígidas de transparência, ações só ordinárias e proteção reforçada aos minoritários.',
    body: [
      'O <strong>Novo Mercado</strong> é o segmento de listagem mais exigente da <a href="/glossario/b3">B3</a> em termos de governança. Criado para elevar o padrão das empresas brasileiras, ele impõe regras que vão muito além do mínimo legal, com foco em transparência e nos direitos de quem investe pouco.',
      'Entre as exigências, três se destacam: só são admitidas <a href="/glossario/acoes-on-pn">ações ordinárias</a>, todas com direito a voto; o <a href="/glossario/tag-along">tag along</a> é de 100%, garantindo que o minoritário receba o mesmo valor do controlador numa venda de controle; e há um <a href="/glossario/free-float">free float</a> mínimo, além de conselho com membros independentes e demonstrações em padrão internacional.',
      'Para o investidor, o Novo Mercado funciona como um selo. Ele não garante que a empresa seja lucrativa, mas reduz o risco de governança: menos surpresas com acionistas majoritários, mais informação e regras claras de proteção. É por isso que muitas das empresas mais conhecidas da bolsa estão nesse segmento.',
      'Ressalva honesta: governança boa não é sinônimo de investimento bom. Uma empresa do Novo Mercado pode ter resultados ruins, e uma fora dele pode ser excelente. O segmento reduz um tipo específico de risco, o de governança, e deve entrar na análise junto dos fundamentos. Avalie a qualidade das empresas no <a href="/ranking/redentia-score">ranking do Redentia Score</a>.',
    ],
    related: ['acoes-on-pn', 'tag-along', 'free-float', 'b3'],
    backlink: {
      label: 'Ver a qualidade das empresas pelo Redentia Score',
      to: '/ranking/redentia-score',
    },
    faq: [
      {
        q: 'O que é o Novo Mercado da B3?',
        a: 'É o segmento de listagem com o mais alto padrão de governança da bolsa brasileira. Empresas nele só podem ter ações ordinárias, oferecem tag along de 100% e seguem regras rígidas de transparência e proteção aos minoritários.',
      },
      {
        q: 'Estar no Novo Mercado garante que a ação é boa?',
        a: 'Não. O Novo Mercado reduz o risco de governança, mas não diz nada sobre a lucratividade do negócio. Uma empresa bem governada ainda pode ter desempenho fraco, por isso a análise dos fundamentos continua indispensável.',
      },
      {
        q: 'Qual a diferença entre Novo Mercado e os outros níveis?',
        a: 'O Novo Mercado é o mais exigente. Os níveis 2 e 1 e o mercado tradicional admitem ações preferenciais e regras menos rígidas de governança. Quanto mais alto o segmento, maior a proteção ao investidor minoritário.',
      },
    ],
  },
  {
    slug: 'b3',
    term: 'B3',
    letter: 'B',
    short:
      'B3 (Brasil, Bolsa, Balcão) é a bolsa de valores oficial do Brasil, o único ambiente onde ações, FIIs, ETFs e derivativos são negociados no país.',
    body: [
      'A <strong>B3</strong>, sigla de Brasil, Bolsa, Balcão, é a bolsa de valores oficial do país, resultado da fusão entre a antiga BM&F e a Bovespa. É nela que se negociam ações, <a href="/glossario/fii">FIIs</a>, <a href="/glossario/etf">ETFs</a>, BDRs, opções e contratos futuros, todos em um único ambiente regulado.',
      'O funcionamento segue horários e regras próprias. O pregão regular acontece nos dias úteis, dentro de uma janela definida, e a liquidação das operações de ações ocorre em D+2, dois dias úteis após o negócio. É a B3 que registra quem é dono de cada ativo e garante que compra e venda cheguem ao fim.',
      'O acesso do investidor é sempre indireto, por meio de uma <a href="/glossario/corretora">corretora</a>. Você envia ordens pelo <a href="/glossario/home-broker">home broker</a> e a corretora as encaminha à B3, que casa compradores e vendedores. Curiosamente, a própria B3 é uma empresa listada em bolsa e pode ser comprada como investimento.',
      'Ressalva honesta: a B3 é a infraestrutura, não a garantia. Ela organiza e dá segurança à negociação, mas não protege ninguém contra escolhas ruins de ativos nem contra a oscilação de preços. Explore tudo o que é negociado nela no <a href="/rankings">screener de ativos</a>.',
    ],
    related: ['ibovespa', 'home-broker', 'corretora', 'ifix'],
    backlink: {
      label: 'Explorar ações e FIIs negociados na B3',
      to: '/rankings',
    },
    faq: [
      {
        q: 'O que é a B3?',
        a: 'É a bolsa de valores oficial do Brasil, onde são negociados ações, fundos imobiliários, ETFs, BDRs e derivativos. Ela nasceu da fusão entre a BM&F e a Bovespa e concentra praticamente todo o mercado de capitais do país.',
      },
      {
        q: 'Como comprar ações na B3?',
        a: 'É preciso abrir conta em uma corretora, transferir recursos e enviar ordens pelo home broker. A corretora encaminha as ordens à B3, que executa a compra ou a venda casando compradores e vendedores.',
      },
      {
        q: 'A B3 é uma empresa que dá para investir?',
        a: 'Sim. Além de operar a bolsa, a própria B3 é uma companhia de capital aberto, listada e negociada como qualquer outra ação, com seu papel disponível para os investidores.',
      },
    ],
  },
  {
    slug: 'home-broker',
    term: 'Home Broker',
    letter: 'H',
    short:
      'Home broker é a plataforma online da corretora pela qual o investidor envia ordens de compra e venda de ações, FIIs e outros ativos diretamente para a B3.',
    body: [
      'O <strong>home broker</strong> é a plataforma, em site ou aplicativo, pela qual você compra e vende ativos na <a href="/glossario/b3">B3</a> sem sair de casa. Ele é oferecido pela <a href="/glossario/corretora">corretora</a> e funciona como a ponte entre as suas ordens e o pregão: você clica, a ordem viaja até a bolsa e a execução acontece em segundos.',
      'O fluxo é simples: abrir conta em uma corretora, transferir dinheiro, acessar o home broker e enviar as ordens. Existem tipos diferentes de ordem, como a ordem a mercado (executa pelo melhor preço disponível na hora) e a ordem limitada (só executa no preço que você definir), além das ordens automáticas.',
      'Entre as ordens automáticas estão o <a href="/glossario/stop-loss">stop loss</a>, que vende sozinho se o preço cair abaixo de um limite para conter perdas, e o stop gain, que realiza o lucro num alvo definido. Bons home brokers também trazem o book de ofertas, gráficos e o histórico consolidado da posição.',
      'Ressalva honesta: a ferramenta facilita, mas também facilita o excesso. A rapidez de operar de casa pode estimular o giro desnecessário da carteira, que gera custos e impostos e raramente melhora o resultado no longo prazo. Antes de operar, vale entender o básico no guia de <a href="/guias/como-investir-em-acoes">como investir em ações</a>.',
    ],
    related: ['b3', 'corretora', 'stop-loss', 'custodia'],
    backlink: {
      label: 'Aprender o passo a passo para investir em ações',
      to: '/guias/como-investir-em-acoes',
    },
    faq: [
      {
        q: 'O que é home broker?',
        a: 'É a plataforma online da corretora usada para comprar e vender ativos na bolsa. Por ela, o investidor envia ordens que são encaminhadas à B3 e executadas em segundos, sem intermediação por telefone.',
      },
      {
        q: 'Home broker tem custo?',
        a: 'A plataforma em si costuma ser gratuita na maioria das corretoras, mas podem existir custos de corretagem, emolumentos da B3 e taxa de custódia, que variam conforme a instituição. Muitas corretoras zeram a corretagem para ações.',
      },
      {
        q: 'Quais tipos de ordem existem no home broker?',
        a: 'As mais comuns são a ordem a mercado, executada pelo melhor preço disponível, e a limitada, que só executa no preço definido. Há ainda as ordens automáticas, como stop loss e stop gain, para limitar perdas ou realizar lucros.',
      },
    ],
  },
  {
    slug: 'tesouro-ipca',
    term: 'Tesouro IPCA+',
    letter: 'T',
    short:
      'Tesouro IPCA+ é um título público que paga a variação da inflação (IPCA) mais uma taxa de juros real fixa, garantindo ganho acima da inflação para quem carrega até o vencimento.',
    body: [
      'O <strong>Tesouro IPCA+</strong> é o título do <a href="/glossario/tesouro-direto">Tesouro Direto</a> pensado para o longo prazo. Ele paga duas coisas somadas: a variação do <a href="/glossario/ipca">IPCA</a>, o índice oficial de inflação, mais uma taxa de juros real fixa contratada na compra. Assim, você recebe a inflação de volta e ainda ganha por cima dela.',
      'Esse desenho garante o chamado ganho real. Enquanto o Tesouro Selic protege o poder de compra acompanhando os juros, o IPCA+ o protege acompanhando a <a href="/glossario/inflacao">inflação</a>, o que o torna adequado para objetivos distantes, como aposentadoria e educação dos filhos, em que o inimigo número um é a corrosão dos preços ao longo dos anos.',
      'Há duas versões. A tradicional paga tudo no vencimento, ideal para acumular. A versão com juros semestrais paga cupons ao longo do caminho, útil para quem já quer renda periódica. Em ambas, quanto mais longo o vencimento, maior costuma ser a taxa real oferecida.',
      'Ressalva honesta: a garantia de ganho real só vale para quem segura o título até o fim. Por causa da marcação a mercado, vender antes do vencimento quando os juros subiram pode significar prejuízo, mesmo sendo um título público. <strong>Exemplo ilustrativo:</strong> um IPCA+ que paga inflação mais 6% entrega, num ano de 4% de inflação, cerca de 10,2% no período (composto). Compare os títulos no <a href="/tesouro">Tesouro</a>.',
    ],
    related: ['tesouro-direto', 'ipca', 'inflacao', 'tesouro-selic'],
    backlink: {
      label: 'Ver os títulos Tesouro IPCA+ disponíveis',
      to: '/tesouro',
    },
    faq: [
      {
        q: 'Como funciona o rendimento do Tesouro IPCA+?',
        a: 'Ele soma duas partes: a variação do IPCA no período mais uma taxa de juros real fixa acordada na compra. Isso garante que o dinheiro renda acima da inflação para quem carrega o título até o vencimento.',
      },
      {
        q: 'Posso perder dinheiro no Tesouro IPCA+?',
        a: 'Sim, se vender antes do vencimento e as taxas de juros tiverem subido, por causa da marcação a mercado. A promessa de ganho real acima da inflação só é garantida para quem mantém o título até a data final.',
      },
      {
        q: 'Para que serve o Tesouro IPCA+?',
        a: 'É indicado para objetivos de longo prazo, como aposentadoria e educação, porque protege o poder de compra ao pagar inflação mais um juro real. É o título do Tesouro mais alinhado a metas distantes no tempo.',
      },
    ],
  },
  {
    slug: 'tesouro-selic',
    term: 'Tesouro Selic',
    letter: 'T',
    short:
      'Tesouro Selic é o título público pós-fixado que acompanha a taxa Selic, com liquidez diária e baixíssima oscilação, ideal para a reserva de emergência.',
    body: [
      'O <strong>Tesouro Selic</strong> é o título do <a href="/glossario/tesouro-direto">Tesouro Direto</a> mais indicado para a reserva de emergência. Ele é pós-fixado e acompanha a <a href="/glossario/selic">Selic</a>: enquanto a taxa básica estiver em determinado patamar, o título rende praticamente isso, dia após dia, sem sustos.',
      'A combinação que o torna especial é liquidez com estabilidade. Ele tem liquidez diária, ou seja, dá para resgatar a qualquer momento, e quase não sofre marcação a mercado, então o preço não balança quando os juros mudam. Por isso costuma ser o destino natural do dinheiro que precisa estar seguro e acessível.',
      'Comparado à poupança, ele leva vantagem em rendimento, já que rende perto da Selic (descontada apenas a taxa de custódia da B3), enquanto a poupança segue uma regra própria que rende menos quando a Selic está alta. Somando <a href="/glossario/liquidez">liquidez</a>, segurança e rendimento, ele é uma escolha comum para o colchão financeiro.',
      'Ressalva honesta: sobre o rendimento incide Imposto de Renda regressivo, então prazos muito curtos são menos eficientes, e há a taxa de custódia da B3. Ainda assim, para reserva, a segurança e a liquidez costumam pesar mais que a mordida do imposto. Monte a sua reserva a partir do <a href="/tesouro">Tesouro</a>.',
    ],
    related: ['tesouro-direto', 'selic', 'cdi', 'liquidez'],
    backlink: {
      label: 'Ver o Tesouro Selic e montar a reserva',
      to: '/tesouro',
    },
    faq: [
      {
        q: 'Por que o Tesouro Selic é indicado para reserva de emergência?',
        a: 'Porque une liquidez diária, segurança de título público e baixíssima oscilação de preço. Você pode resgatar quando precisar sem risco de encontrar o dinheiro desvalorizado, o que é essencial para uma reserva.',
      },
      {
        q: 'O Tesouro Selic pode perder valor?',
        a: 'É o título público que menos oscila, por acompanhar a Selic e ter marcação a mercado muito pequena. Na prática, o valor tende a subir de forma estável, o que o diferencia dos títulos prefixados e IPCA+.',
      },
      {
        q: 'Tesouro Selic rende mais que a poupança?',
        a: 'Em geral sim, principalmente quando a Selic está alta, porque rende perto da taxa básica descontada só da custódia da B3. A poupança segue uma regra própria que costuma entregar menos nesses cenários, embora seja isenta de imposto.',
      },
    ],
  },
  {
    slug: 'cdb',
    term: 'CDB',
    letter: 'C',
    short:
      'CDB (Certificado de Depósito Bancário) é um título de renda fixa emitido por bancos, protegido pelo FGC, no qual você empresta dinheiro à instituição em troca de juros.',
    body: [
      'O <strong>CDB</strong> (Certificado de Depósito Bancário) é um dos investimentos de renda fixa mais populares do país. A lógica é direta: o banco precisa captar recursos, emite o título, você compra e, em troca, recebe juros. No vencimento, resgata o valor aplicado acrescido do rendimento.',
      'Há três formatos de rentabilidade. O pós-fixado paga um percentual do <a href="/glossario/cdi">CDI</a>, o mais comum. O prefixado trava uma taxa fixa conhecida na compra. E o híbrido paga <a href="/glossario/ipca">IPCA</a> mais uma taxa, misturando proteção contra inflação e ganho real. A escolha depende do seu objetivo e da sua leitura sobre os juros.',
      'A grande rede de segurança é o FGC, o Fundo Garantidor de Créditos, que cobre aplicações até um limite por CPF e por instituição em caso de quebra do banco. Por isso bancos menores, que precisam atrair mais capital, costumam pagar percentuais do CDI mais altos que os grandes, dentro do guarda-chuva do FGC.',
      'Ressalva honesta: nem todo CDB tem liquidez diária. Muitos têm carência ou só liberam o dinheiro no vencimento, e sobre o rendimento incide Imposto de Renda regressivo. Vale conferir prazo, liquidez e a solidez do emissor antes de aplicar, sobretudo acima do teto do FGC. <strong>Exemplo ilustrativo:</strong> um CDB de 110% do CDI, num período em que o CDI rende 10%, entrega cerca de 11% bruto. Simule na <a href="/calculadora/juros-compostos">calculadora de juros compostos</a>.',
    ],
    related: ['cdi', 'lci-lca', 'tesouro-selic', 'selic'],
    backlink: {
      label: 'Simular o rendimento de um CDB no tempo',
      to: '/calculadora/juros-compostos',
    },
    faq: [
      {
        q: 'CDB é seguro?',
        a: 'Tem uma camada importante de proteção: o FGC cobre aplicações até um limite por CPF e por instituição caso o banco quebre. Ainda assim, vale avaliar a solidez do emissor, sobretudo para valores acima do teto garantido.',
      },
      {
        q: 'Qual a diferença entre CDB e Tesouro Direto?',
        a: 'O CDB é emitido por bancos e protegido pelo FGC; o Tesouro Direto é emitido pelo governo e tem risco soberano, sem necessidade de FGC. Ambos podem ser pós-fixados, prefixados ou atrelados à inflação, com regras de liquidez e tributação parecidas.',
      },
      {
        q: 'Todo CDB tem liquidez diária?',
        a: 'Não. Alguns permitem resgate a qualquer momento, mas muitos têm carência ou só liberam o valor no vencimento. Antes de investir, é essencial checar as condições de liquidez para não precisar do dinheiro num momento em que ele está travado.',
      },
    ],
  },
  {
    slug: 'lci-lca',
    term: 'LCI e LCA',
    letter: 'L',
    short:
      'LCI e LCA são títulos de renda fixa isentos de Imposto de Renda para pessoa física, lastreados respectivamente em crédito imobiliário e do agronegócio e protegidos pelo FGC.',
    body: [
      'A <strong>LCI</strong> (Letra de Crédito Imobiliário) e a <strong>LCA</strong> (Letra de Crédito do Agronegócio) são títulos de renda fixa emitidos por bancos, muito parecidos com o <a href="/glossario/cdb">CDB</a>, com uma diferença que faz toda a diferença: são isentos de Imposto de Renda para a pessoa física.',
      'A distinção entre as duas está apenas no lastro. A LCI é garantida por créditos imobiliários, como financiamentos de imóveis; a LCA, por créditos do agronegócio. Para o investidor, na prática, funcionam da mesma forma, e ambas contam com a proteção do FGC dentro dos limites por CPF e instituição.',
      'A isenção muda a comparação. Como não há mordida do imposto, uma LCI que paga um percentual menor do <a href="/glossario/cdi">CDI</a> pode render, no líquido, o mesmo que um CDB de percentual mais alto. Por isso, na hora de comparar renda fixa, o certo é olhar o rendimento líquido, e não a taxa bruta anunciada.',
      'Ressalva honesta: a isenção vem com contrapartidas. LCI e LCA costumam exigir aplicação mínima maior e têm carência, ou seja, prazo mínimo antes de poder resgatar, o que reduz a liquidez. <strong>Exemplo ilustrativo:</strong> uma LCI de 90% do CDI isenta pode superar um CDB de 100% do CDI depois do imposto. Compare o líquido na <a href="/calculadora/juros-compostos">calculadora de juros compostos</a>.',
    ],
    related: ['cdb', 'cdi', 'cri', 'tesouro-selic'],
    backlink: {
      label: 'Comparar o rendimento líquido na calculadora',
      to: '/calculadora/juros-compostos',
    },
    faq: [
      {
        q: 'Por que LCI e LCA são isentas de Imposto de Renda?',
        a: 'Porque são instrumentos usados para financiar setores estratégicos, o imobiliário e o agronegócio, e o governo concede a isenção para a pessoa física como incentivo. Essa isenção é a principal vantagem desses títulos frente ao CDB.',
      },
      {
        q: 'Qual a diferença entre LCI e LCA?',
        a: 'A diferença está no lastro: a LCI é garantida por crédito imobiliário e a LCA por crédito do agronegócio. Para o investidor, o funcionamento, a isenção de imposto e a proteção do FGC são praticamente iguais nas duas.',
      },
      {
        q: 'LCI de 90% do CDI é melhor que CDB de 100% do CDI?',
        a: 'Pode ser, porque a LCI é isenta de imposto e o CDB não. Depois de descontado o IR do CDB, uma LCI com percentual um pouco menor às vezes entrega mais no líquido. O certo é sempre comparar o rendimento líquido, considerando também prazo e liquidez.',
      },
    ],
  },
  {
    slug: 'cri',
    term: 'CRI',
    letter: 'C',
    short:
      'CRI (Certificado de Recebíveis Imobiliários) é um título de renda fixa lastreado em dívidas do setor imobiliário, isento de IR para pessoa física e muito usado pelos fundos de papel.',
    body: [
      'O <strong>CRI</strong> (Certificado de Recebíveis Imobiliários) é um título de renda fixa que representa uma promessa de pagamento futuro de dívidas do setor imobiliário, como financiamentos e aluguéis. Ao comprar um CRI, você passa a receber os juros que os devedores pagam ao longo do tempo, com isenção de Imposto de Renda para a pessoa física.',
      'O caminho até o investidor passa por uma securitizadora, que empacota vários recebíveis (parcelas a receber de vendas e financiamentos) e transforma esse conjunto em títulos negociáveis. Os rendimentos costumam ser atrelados ao <a href="/glossario/ipca">IPCA</a> ou ao <a href="/glossario/cdi">CDI</a> mais uma taxa, refletindo o risco de cada operação.',
      'É por meio dos CRIs que boa parte da renda imobiliária chega ao pequeno investidor. Os <a href="/glossario/fundos-papel">fundos de papel</a> (<a href="/glossario/fii">FIIs</a> de recebíveis) montam carteiras diversificadas de CRIs e repassam os juros aos cotistas, uma forma acessível de investir nesses títulos, que comprados diretamente exigem aplicações altas.',
      'Ressalva honesta: CRI não tem a proteção do FGC. O risco central é o de crédito, isto é, o de os devedores não pagarem, e a liquidez é baixa, o que dificulta vender antes do vencimento. Por isso o rating e a qualidade do emissor pesam tanto. Uma porta de entrada mais diversificada é o <a href="/rankings?classe=fiis">ranking de FIIs</a> de papel.',
    ],
    related: ['fii', 'fundos-papel', 'lci-lca', 'cdb'],
    backlink: {
      label: 'Ver os FIIs de papel que investem em CRIs',
      to: '/rankings?classe=fiis',
    },
    faq: [
      {
        q: 'CRI tem garantia do FGC?',
        a: 'Não. Diferente de CDB, LCI e LCA, o CRI não conta com a proteção do Fundo Garantidor de Créditos. O principal risco é o de crédito, o de os devedores dos recebíveis não honrarem os pagamentos, o que exige atenção ao rating e ao emissor.',
      },
      {
        q: 'Qual a diferença entre CRI e fundo de papel?',
        a: 'O CRI é o título individual de recebível imobiliário; o fundo de papel é um FII que reúne vários CRIs em uma carteira. Investir pelo fundo dá diversificação e valor de entrada baixo, enquanto comprar o CRI direto costuma exigir aplicações altas.',
      },
      {
        q: 'CRI é isento de Imposto de Renda?',
        a: 'Sim, para a pessoa física o rendimento do CRI é isento de IR, assim como LCI e LCA. Essa isenção ajuda a compensar a ausência de garantia do FGC e a menor liquidez do título.',
      },
    ],
  },
]

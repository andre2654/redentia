import type { MethodId } from '~/utils/preco-teto'

/**
 * Conteúdo das páginas /calculadora/preco-teto/{metodo}.
 *
 * POR QUE MÉTODO E NÃO TICKER. Decompondo as consultas de "preço teto" no Search
 * Console (92 dias até 03/08/2026), por modificador:
 *   núcleo genérico   32 consultas · 2.665 impr · 600 cliques · CTR 22,51%
 *   "como calcular"   10 ·  1.662 · 113 · 6,80%
 *   "bazin"           16 ·  1.042 ·  71 · 6,81%
 *   "graham"           1 ·    106 ·   6 · 5,66%
 *   "fii"              2 ·     67 ·   7 · 10,45%
 *   + TICKER          10 ·    190 ·   1 ·  0,53%
 * Método vale 2.956 impressões contra 190 do ticker: razão de 15,6 para 1 em
 * impressão e de 249 para 1 em clique. Fanout por ticker era a rota óbvia e
 * errada; a demanda mede o contrário.
 *
 * REGRA DE CONTEÚDO: cada método aqui tem FÓRMULA DIFERENTE. Barsi ficou de
 * fora de propósito — a régua dele é dividendo ÷ 6%, aritmeticamente idêntica
 * à do Bazin, e publicar duas páginas com a mesma conta é fabricar duplicata.
 */
export interface PrecoTetoMetodo {
  slug: string
  id: MethodId
  /** <title> da SERP. */
  metaTitle: string
  metaDescription: string
  h1: string
  /** Parágrafo answer-first: a resposta ANTES da ferramenta. */
  answerFirst: string
  formula: string
  /** Insumos que a calculadora desta página realmente usa. */
  inputs: ('price' | 'lpa' | 'vpa' | 'dividend' | 'sectorPL' | 'growth')[]
  /** Corpo: H2 + parágrafos. */
  sections: { h2: string; body: string[] }[]
  faq: { q: string; a: string }[]
  /** Exemplo numérico fechado, com a conta escrita. */
  exemplo: { titulo: string; linhas: string[] }
}

export const PRECO_TETO_METODOS: Record<string, PrecoTetoMetodo> = {
  bazin: {
    slug: 'bazin',
    id: 'bazin',
    metaTitle: 'Preço Teto de Bazin: calculadora e fórmula (dividendo ÷ 6%)',
    metaDescription: 'Calcule o preço teto pelo método Décio Bazin: dividendo dos últimos 12 meses dividido por 6%. Fórmula, exemplo numérico com PETR4 e as três regras que Bazin exigia antes de comprar.',
    h1: 'Preço teto de Bazin: a conta do dividendo dividido por 6%',
    answerFirst: 'O preço teto de Bazin é o dividendo por ação dos últimos 12 meses dividido por 0,06. Uma ação que pagou R$ 3,00 por ação no período tem preço teto de R$ 50,00 (3 ÷ 0,06). Acima disso, pelo critério de Bazin, o dividend yield cai abaixo dos 6% que ele exigia e a ação sai da lista de compra.',
    formula: 'Preço teto = Dividendo por ação (12 meses) ÷ 0,06',
    inputs: ['price', 'dividend'],
    sections: [
      {
        h2: 'De onde vem o 6%',
        body: [
          'Décio Bazin descreveu o método em "Faça Fortuna com Ações", publicado em 1991. O 6% não é uma constante de mercado nem uma dedução teórica: é o piso de rendimento que ele considerava aceitável para assumir o risco de renda variável em vez de renda fixa, no Brasil, naquele contexto de juros.',
          'A crítica mais comum ao método ataca exatamente esse ponto. Com a Selic a 15%, exigir 6% de dividend yield para comprar uma ação é aceitar rendimento menor que o do Tesouro Selic com risco muito maior. Com a Selic a 2%, o mesmo 6% vira um filtro severíssimo que quase nenhuma empresa passa.',
          'Quem usa o método hoje costuma ajustar o yield exigido ao custo de oportunidade do momento, e a calculadora abaixo permite isso. Mas vale registrar: no momento em que você troca o 6% por outro número, deixou de calcular o preço teto de Bazin e passou a calcular o seu.',
        ],
      },
      {
        h2: 'As três regras que vêm antes da conta',
        body: [
          'A fórmula é a parte famosa do método e a menos importante. Bazin filtrava a empresa antes de calcular qualquer coisa, e a conta só valia para o que sobrava do filtro.',
          'A primeira regra é histórico de dividendos consistente. Bazin queria pelo menos cinco anos de pagamento ininterrupto, porque um dividendo isolado não diz nada sobre capacidade de distribuição e um yield alto costuma ser efeito de preço caindo, não de dividendo subindo.',
          'A segunda é endividamento sob controle. Empresa que distribui dividendo enquanto rola dívida cara está devolvendo capital que deveria estar amortizando passivo, e isso termina em corte de dividendo ou em emissão de ações.',
          'A terceira é ausência de "cavalo de pau" na gestão: mudanças bruscas de estratégia, de controlador ou de política de distribuição invalidam a premissa de que o histórico projeta o futuro, que é a base inteira do método.',
        ],
      },
      {
        h2: 'Onde o método falha',
        body: [
          'O método de Bazin é cego para crescimento. Uma empresa que reinveste todo o lucro e não distribui nada tem preço teto zero pela fórmula, o que é obviamente falso como avaliação de valor. Por isso Bazin não serve para avaliar empresa de crescimento, e ele mesmo não usava para isso.',
          'Ele também é sensível a dividendo extraordinário. Um pagamento único e grande, típico de venda de ativo, infla o dividendo dos últimos 12 meses e projeta um preço teto que não se sustenta no ciclo seguinte. O ajuste honesto é usar o dividendo recorrente, excluindo o evento não repetível.',
          'E é sensível ao ciclo. Petrobras em 2022 pagou dividendo que gerava yield acima de 50% ao ano: aplicar Bazin ali produzia um preço teto várias vezes acima do preço de mercado, sinalizando compra num topo de ciclo de petróleo.',
        ],
      },
    ],
    exemplo: {
      titulo: 'Exemplo fechado',
      linhas: [
        'Dividendo dos últimos 12 meses: R$ 3,00 por ação',
        'Yield exigido: 6% (0,06)',
        'Preço teto = 3,00 ÷ 0,06 = R$ 50,00',
        'Preço de mercado R$ 38,00 → margem de segurança de 31,6%',
        'Preço de mercado R$ 55,00 → 10% acima do teto, fora da regra',
      ],
    },
    faq: [
      { q: 'Qual a fórmula do preço teto de Bazin?', a: 'Preço teto = dividendo por ação dos últimos 12 meses dividido por 0,06. O 0,06 representa o dividend yield mínimo de 6% ao ano que Décio Bazin exigia para considerar uma ação atrativa.' },
      { q: 'Posso usar um yield diferente de 6%?', a: 'Pode, e muita gente ajusta ao custo de oportunidade do momento (com Selic alta, exigir mais que 6% faz sentido). Mas ao trocar o percentual você deixa de calcular o preço teto de Bazin e passa a calcular o seu próprio critério. Deixe explícito qual yield usou quando comparar com outras fontes.' },
      { q: 'Bazin serve para FIIs?', a: 'Serve, e é onde o método envelhece melhor, porque fundo imobiliário distribui no mínimo 95% do lucro semestral por lei e o rendimento é mensal e mais previsível que dividendo de empresa. A régua costuma ser o rendimento dos últimos 12 meses dividido pelo yield desejado.' },
      { q: 'Devo usar o dividendo bruto ou líquido?', a: 'Dividendo de ação é isento de imposto de renda na pessoa física, então bruto e líquido coincidem. Já JCP (juros sobre capital próprio) tem retenção de 15% na fonte: se a empresa remunera via JCP, use o valor líquido para não superestimar o preço teto.' },
      { q: 'O preço teto de Bazin é preço-alvo?', a: 'Não. Preço-alvo é projeção de para onde a ação vai. Preço teto é o máximo que você aceita pagar hoje para que o rendimento faça sentido. São conceitos diferentes e não devem ser comparados diretamente.' },
    ],
  },

  graham: {
    slug: 'graham',
    id: 'graham',
    metaTitle: 'Fórmula de Graham: calculadora do preço justo √(22,5 × LPA × VPA)',
    metaDescription: 'Calcule o valor intrínseco de uma ação pela fórmula de Benjamin Graham: raiz de 22,5 × LPA × VPA. De onde vem o 22,5, exemplo numérico e as limitações que o próprio Graham reconhecia.',
    h1: 'Fórmula de Graham: o preço justo pela raiz de 22,5 × LPA × VPA',
    answerFirst: 'A fórmula de Graham calcula o valor intrínseco como a raiz quadrada de 22,5 multiplicado pelo LPA e pelo VPA. Uma empresa com LPA de R$ 3,50 e VPA de R$ 18,00 tem valor intrínseco de R$ 35,55, porque √(22,5 × 3,50 × 18) = 35,55. Comprar abaixo disso é comprar com margem de segurança.',
    formula: 'Valor intrínseco = √(22,5 × LPA × VPA)',
    inputs: ['price', 'lpa', 'vpa'],
    sections: [
      {
        h2: 'O 22,5 é o produto de dois limites',
        body: [
          'O número 22,5 parece arbitrário e não é: ele é 15 multiplicado por 1,5. Benjamin Graham, em "O Investidor Inteligente", propôs que uma ação defensiva não deveria ser comprada acima de P/L 15 nem acima de P/VP 1,5.',
          'Multiplicar os dois limites e tirar a raiz do produto com LPA e VPA é uma forma compacta de dizer "o preço em que P/L × P/VP = 22,5". A fórmula permite compensação entre os dois: uma empresa pode ter P/L acima de 15 se o P/VP estiver bem abaixo de 1,5, e vice-versa.',
          'Isso é importante na hora de interpretar o resultado. A fórmula não afirma que a ação vale aquilo. Ela afirma que, nos critérios conservadores de Graham para investidor defensivo, aquele é o teto de preço em que a combinação de lucro e patrimônio ainda é defensável.',
        ],
      },
      {
        h2: 'Por que Graham não usaria essa fórmula sozinha',
        body: [
          'O próprio Graham tratava esses múltiplos como critério de triagem, não como avaliação. No mesmo livro ele lista outros filtros: tamanho mínimo da empresa, situação financeira sólida (ativo circulante ao menos o dobro do passivo circulante), estabilidade de lucros por dez anos, histórico de dividendos ininterrupto por vinte anos e crescimento de lucro por ação de pelo menos um terço em dez anos.',
          'Uma ação que passa na fórmula e reprova nesses filtros não era candidata de Graham. A fórmula isolada, do jeito que circula na internet, é a parte mais fácil de calcular do método e a que menos protege.',
        ],
      },
      {
        h2: 'Onde a fórmula quebra no Brasil de hoje',
        body: [
          'A fórmula assume patrimônio líquido como proxy razoável de valor de liquidação, o que fazia sentido numa economia de ativos tangíveis. Empresa de software, marca ou serviço tem VPA baixo relativo ao poder de geração de caixa, e a fórmula sistematicamente subavalia esse perfil.',
          'Ela também ignora dívida. Duas empresas com LPA e VPA idênticos recebem o mesmo valor intrínseco mesmo que uma esteja alavancada em 4x EBITDA e a outra tenha caixa líquido. Para papéis alavancados, olhe EV/EBITDA junto.',
          'E é inutilizável com LPA negativo: prejuízo zera a conta. Isso não é defeito, é o método se recusando a avaliar empresa que não dá lucro, que é exatamente o que Graham pretendia.',
        ],
      },
    ],
    exemplo: {
      titulo: 'Exemplo fechado',
      linhas: [
        'LPA (lucro por ação, 12 meses): R$ 3,50',
        'VPA (valor patrimonial por ação): R$ 18,00',
        '22,5 × 3,50 × 18,00 = 1.417,50',
        'Valor intrínseco = √1.417,50 = R$ 37,65',
        'Preço de mercado R$ 28,00 → 34,5% de margem de segurança',
      ],
    },
    faq: [
      { q: 'De onde vem o número 22,5 na fórmula de Graham?', a: 'É o produto de 15 por 1,5: o P/L máximo de 15 e o P/VP máximo de 1,5 que Graham propunha para o investidor defensivo em "O Investidor Inteligente". A fórmula é uma forma compacta de expressar o preço em que P/L × P/VP chega a 22,5.' },
      { q: 'A fórmula de Graham funciona para qualquer ação?', a: 'Não. Ela depende de LPA e VPA positivos e assume que o patrimônio líquido representa bem o valor da empresa. Falha em empresas com prejuízo, em negócios de ativos intangíveis (software, marcas, serviços) e ignora completamente o endividamento.' },
      { q: 'Qual a diferença entre valor intrínseco e preço teto?', a: 'Na prática do mercado brasileiro os dois termos são usados como sinônimos para o resultado dessa fórmula. Tecnicamente, valor intrínseco é a estimativa do que a empresa vale e preço teto é o máximo que você aceita pagar, que costuma ser o valor intrínseco menos uma margem de segurança adicional.' },
      { q: 'Onde encontro o LPA e o VPA de uma ação?', a: 'Nos releases de resultado trimestral da própria empresa (área de Relações com Investidores) e nas demonstrações financeiras enviadas à CVM. A calculadora desta página busca esses dados automaticamente quando você digita o ticker.' },
    ],
  },

  'pl-setorial': {
    slug: 'pl-setorial',
    id: 'pl-setorial',
    metaTitle: 'Preço teto por P/L setorial: calculadora e quando usar',
    metaDescription: 'Calcule o preço teto multiplicando o LPA pelo P/L médio do setor. Método relativo: por que ele corrige o que Graham e Bazin ignoram e onde ele engana em setor inteiro caro.',
    h1: 'Preço teto por P/L setorial: LPA vezes o múltiplo dos pares',
    answerFirst: 'O preço teto por P/L setorial é o lucro por ação multiplicado pelo P/L médio do setor. Uma empresa com LPA de R$ 3,50 num setor que negocia a P/L 10 tem preço teto de R$ 35,00. É o único dos métodos clássicos que responde "caro comparado a quem", em vez de comparar com uma constante fixa.',
    formula: 'Preço teto = LPA × P/L médio do setor',
    inputs: ['price', 'lpa', 'sectorPL'],
    sections: [
      {
        h2: 'O que este método corrige nos outros',
        body: [
          'Graham compara com um P/L fixo de 15 e Bazin com um yield fixo de 6%. Os dois foram calibrados em outra economia e não sabem que banco, elétrica e varejo negociam em faixas de múltiplo estruturalmente diferentes, por motivos que não são desconto nem prêmio, e sim natureza do negócio.',
          'Uma transmissora de energia com receita contratada e indexada tem previsibilidade que um varejista não tem, e o mercado paga por isso. Comparar as duas com o mesmo P/L de referência produz a conclusão errada nas duas direções: a elétrica parece sempre cara, o varejo parece sempre barato.',
          'O P/L setorial resolve isso trocando a constante por um comparável. A pergunta deixa de ser "está cara em absoluto" e passa a ser "está cara em relação aos pares dela".',
        ],
      },
      {
        h2: 'A armadilha do método relativo',
        body: [
          'Método relativo herda o erro da referência. Se o setor inteiro está caro, o P/L médio está inflado e o preço teto sai inflado junto. O método sinaliza "barato" para uma ação que está apenas menos cara que um setor em bolha.',
          'O caso clássico são ciclos de commodity. No topo do ciclo, o lucro está no pico e o P/L parece baixo, o que faz o múltiplo setorial parecer atrativo justamente quando o risco é maior. É o inverso do que o investidor precisa que o indicador diga.',
          'O antídoto prático é usar o P/L médio histórico do setor em vez do P/L de hoje, e cruzar com um método absoluto. Preço teto por P/L setorial sozinho não é conclusão, é uma das quatro leituras.',
        ],
      },
      {
        h2: 'Como escolher o P/L de referência',
        body: [
          'A classificação setorial da B3 é um ponto de partida, não uma resposta. Setores como "Consumo Cíclico" agrupam empresas com dinâmicas de margem muito diferentes, e a média do agrupamento inteiro dilui a comparação até perder sentido.',
          'A referência mais útil costuma ser um grupo pequeno de pares diretos: mesmo modelo de receita, mesma exposição regulatória, porte comparável. Três a cinco comparáveis bem escolhidos dizem mais que a média de quarenta empresas do mesmo guarda-chuva.',
          'Vale também olhar o próprio histórico do papel. Uma ação negociando a P/L 8 num setor a P/L 10 parece barata, mas se ela negociou a P/L 6 nos últimos cinco anos, o desconto para os pares é estrutural e provavelmente tem motivo.',
        ],
      },
    ],
    exemplo: {
      titulo: 'Exemplo fechado',
      linhas: [
        'LPA (lucro por ação, 12 meses): R$ 3,50',
        'P/L médio do setor: 10',
        'Preço teto = 3,50 × 10 = R$ 35,00',
        'Preço de mercado R$ 28,00 → negocia a P/L 8, com 25% de margem',
        'Se o P/L médio do setor cair para 8, o teto cai para R$ 28,00 e a margem some',
      ],
    },
    faq: [
      { q: 'Como calcular o preço teto pelo P/L setorial?', a: 'Multiplique o lucro por ação dos últimos 12 meses pelo P/L médio do setor. Se o LPA é R$ 3,50 e o setor negocia a P/L 10, o preço teto é R$ 35,00.' },
      { q: 'Onde encontro o P/L médio de um setor da B3?', a: 'Você pode calcular a partir das empresas do setor (a Redentia publica isso em /setor) ou usar a média de um grupo pequeno de pares diretos, que costuma ser mais informativa que a média do setor inteiro.' },
      { q: 'Este método serve para FIIs?', a: 'Não bem. Fundo imobiliário não tem lucro por ação no sentido contábil de empresa; a régua equivalente é P/VP e o dividend yield sobre o rendimento mensal distribuído.' },
      { q: 'O que fazer quando o setor inteiro está caro?', a: 'Use o P/L médio histórico do setor em vez do atual, e cruze com um método absoluto (Graham ou Bazin). Método relativo herda o erro da referência: num setor em bolha, ele sinaliza barato para o que está apenas menos caro.' },
    ],
  },

  'valor-patrimonial': {
    slug: 'valor-patrimonial',
    id: 'valor-patrimonial',
    metaTitle: 'Preço teto pelo valor patrimonial: calculadora VPA × 1,5',
    metaDescription: 'Calcule o preço teto pelo valor patrimonial por ação multiplicado por 1,5, o limite de P/VP de Graham. Quando o VPA é uma âncora útil e quando ele é ficção contábil.',
    h1: 'Preço teto pelo valor patrimonial: VPA vezes 1,5',
    answerFirst: 'O preço teto pelo valor patrimonial é o VPA multiplicado por 1,5. Uma empresa com valor patrimonial de R$ 18,00 por ação tem preço teto de R$ 27,00. O 1,5 é o P/VP máximo que Benjamin Graham aceitava para o investidor defensivo, o mesmo que aparece dentro do 22,5 da fórmula de Graham.',
    formula: 'Preço teto = VPA × 1,5',
    inputs: ['price', 'vpa'],
    sections: [
      {
        h2: 'O que o VPA realmente mede',
        body: [
          'O valor patrimonial por ação é o patrimônio líquido dividido pelo número de ações. Patrimônio líquido é ativo menos passivo pela ótica contábil, o que significa que ele mede o que a empresa registrou nos livros, não o que ela vale se for vendida nem o que ela gera de caixa.',
          'Essa diferença define onde o método funciona. Em banco, seguradora, holding e empresa de ativos tangíveis (imóveis, frotas, plantas industriais), o valor contábil guarda relação razoável com o valor econômico, e o P/VP é um indicador honesto.',
          'Em empresa de software, serviço ou marca, o ativo principal não está no balanço. Uma companhia com marca dominante e nenhum imobilizado relevante pode ter VPA baixíssimo e valer muito, e o método vai declará-la permanentemente cara.',
        ],
      },
      {
        h2: 'P/VP abaixo de 1 nem sempre é barato',
        body: [
          'Uma ação negociando abaixo do valor patrimonial significa que o mercado precifica a empresa por menos do que o patrimônio contábil dela. Isso pode ser oportunidade, mas com frequência é o mercado dizendo que o patrimônio está superavaliado nos livros.',
          'Os casos típicos: estoque obsoleto ainda registrado a custo, recebível de qualidade duvidosa, ágio de aquisição que não se materializou em resultado, e imobilizado que só vale aquilo enquanto operando (uma planta industrial específica pode valer perto de zero em liquidação).',
          'Empresas que destroem valor de forma consistente, com ROE abaixo do custo de capital ano após ano, negociam abaixo do VPA com razão: cada ano de operação reduz o patrimônio. Comprar por "estar barato no P/VP" nesse caso é comprar um ativo que encolhe.',
        ],
      },
      {
        h2: 'Como usar na prática',
        body: [
          'Este é o método mais frágil dos quatro isoladamente e o mais útil como contraprova. Ele funciona bem como piso: se um papel negocia bem abaixo do VPA e a empresa tem ROE consistentemente positivo, há um desconto que merece explicação.',
          'Cruzar P/VP com ROE é o par mais informativo. ROE alto e P/VP baixo é a combinação que Graham procurava. ROE baixo e P/VP baixo costuma ser armadilha de valor, e ROE alto com P/VP alto é a situação normal de uma boa empresa cara.',
        ],
      },
    ],
    exemplo: {
      titulo: 'Exemplo fechado',
      linhas: [
        'VPA (valor patrimonial por ação): R$ 18,00',
        'Limite de P/VP de Graham: 1,5',
        'Preço teto = 18,00 × 1,5 = R$ 27,00',
        'Preço de mercado R$ 28,00 → negocia a P/VP 1,56, acima do teto',
        'Preço de mercado R$ 16,00 → P/VP 0,89, abaixo do patrimônio contábil',
      ],
    },
    faq: [
      { q: 'Como calcular o preço teto pelo valor patrimonial?', a: 'Multiplique o VPA (valor patrimonial por ação) por 1,5. Com VPA de R$ 18,00, o preço teto é R$ 27,00. O 1,5 é o P/VP máximo que Graham aceitava para o investidor defensivo.' },
      { q: 'O que é VPA?', a: 'Valor Patrimonial por Ação: o patrimônio líquido da empresa dividido pelo número total de ações. É uma medida contábil, do que está registrado nos livros, e não do valor de mercado nem da capacidade de gerar caixa.' },
      { q: 'Ação com P/VP abaixo de 1 está barata?', a: 'Nem sempre. Pode significar que o mercado considera o patrimônio superavaliado nos livros (estoque obsoleto, recebível ruim, ágio que não se realizou) ou que a empresa destrói valor com ROE abaixo do custo de capital. Cruze sempre P/VP com ROE.' },
      { q: 'Este método serve para empresas de tecnologia?', a: 'Mal. O ativo principal dessas empresas (software, marca, base de usuários) não aparece no balanço, então o VPA é baixo e o método declara a ação permanentemente cara. Para esse perfil, prefira múltiplos de receita ou fluxo de caixa.' },
    ],
  },

  projetivo: {
    slug: 'projetivo',
    id: 'projetivo',
    metaTitle: 'Preço teto projetivo: calculadora com dividendo futuro estimado',
    metaDescription: 'Calcule o preço teto projetivo: dividendo estimado do próximo ciclo dividido pelo yield desejado. Como projetar o dividendo sem chutar e por que o método amplifica erro de premissa.',
    h1: 'Preço teto projetivo: Bazin sobre o dividendo que ainda vai vir',
    answerFirst: 'O preço teto projetivo aplica a régua de Bazin ao dividendo estimado do próximo ciclo em vez do dividendo já pago. Um papel que distribuiu R$ 3,00 por ação e deve crescer 10% projeta R$ 3,30, e com yield exigido de 6% o preço teto sobe de R$ 50,00 para R$ 55,00. Com crescimento zero, o projetivo é idêntico ao Bazin: sem estimativa, não há projeção.',
    formula: 'Preço teto = [Dividendo × (1 + crescimento)] ÷ Yield desejado',
    inputs: ['price', 'dividend', 'growth'],
    sections: [
      {
        h2: 'O problema que o projetivo tenta resolver',
        body: [
          'Bazin olha para trás. Ele usa o dividendo dos últimos 12 meses como se fosse o dividendo permanente, e isso funciona bem numa empresa madura e estável e mal em qualquer outra situação.',
          'Duas distorções aparecem sempre. A primeira é a empresa em crescimento, que paga pouco hoje porque reinveste, e cujo preço teto por Bazin sai artificialmente baixo. A segunda é a empresa em pico de ciclo, que pagou um dividendo excepcional que não se repete, e cujo preço teto sai artificialmente alto exatamente no pior momento para comprar.',
          'O projetivo troca o dividendo realizado pelo esperado, o que corrige as duas distorções ao custo de introduzir uma premissa.',
        ],
      },
      {
        h2: 'Como estimar o crescimento sem chutar',
        body: [
          'A estimativa mais defensável não vem de opinião, vem de contrato e de histórico. Concessões e transmissoras têm receita indexada à inflação com reajuste em data conhecida: o crescimento nominal do dividendo tem piso previsível.',
          'Para empresas sem esse tipo de contrato, o caminho é a mediana do crescimento de dividendo dos últimos cinco a dez anos, e não a média, porque a média é dominada por um ano excepcional. Se a mediana de crescimento é 4% ao ano, projetar 15% precisa de justificativa específica.',
          'Guidance da própria empresa e política de distribuição declarada (payout mínimo em estatuto, por exemplo) são as fontes mais concretas. Consenso de analistas é utilizável, mas costuma ser otimista de forma sistemática.',
          'A regra prática: se você não consegue escrever em uma frase por que o dividendo vai crescer aquilo, use crescimento zero e assuma que está fazendo Bazin puro.',
        ],
      },
      {
        h2: 'Por que o projetivo amplifica erro',
        body: [
          'A projeção entra no numerador de uma divisão por um número pequeno. Com yield exigido de 6%, cada real de dividendo projetado vira 16,67 reais de preço teto. Um erro de 20% na estimativa de dividendo vira 20% de erro no preço teto, mas em cima de uma base já alavancada.',
          'Isso torna o método perigoso na direção otimista. É trivial construir uma premissa de crescimento que justifica comprar qualquer coisa, e a aparência de rigor da fórmula esconde que o resultado depende inteiramente de um número que você escolheu.',
          'A defesa é assimetria: use a estimativa conservadora de crescimento e o yield exigido mais alto. Se o papel ainda passa, a conclusão é robusta. Se ele só passa com premissa agressiva, a conclusão é a premissa, não a ação.',
        ],
      },
    ],
    exemplo: {
      titulo: 'Exemplo fechado',
      linhas: [
        'Dividendo dos últimos 12 meses: R$ 3,00 por ação',
        'Crescimento estimado: 10% ao ano',
        'Dividendo projetado = 3,00 × 1,10 = R$ 3,30',
        'Preço teto = 3,30 ÷ 0,06 = R$ 55,00',
        'Com crescimento zero, o teto volta a R$ 50,00 (Bazin puro)',
        'Com crescimento de 30%, o teto vai a R$ 65,00: a premissa move 30% do resultado',
      ],
    },
    faq: [
      { q: 'O que é preço teto projetivo?', a: 'É a régua de Bazin aplicada ao dividendo estimado do próximo ciclo em vez do já pago: dividendo projetado dividido pelo yield desejado. Serve para corrigir a distorção do Bazin em empresas em crescimento ou em pico de ciclo.' },
      { q: 'Qual a diferença entre Bazin e Bazin projetivo?', a: 'Bazin usa o dividendo dos últimos 12 meses (dado realizado). O projetivo usa o dividendo esperado do próximo ciclo (estimativa). Com crescimento zero, os dois dão exatamente o mesmo número.' },
      { q: 'Como estimar o crescimento do dividendo?', a: 'Prefira contrato e histórico a opinião: reajuste contratual indexado à inflação, guidance da empresa, política de payout declarada em estatuto, ou a mediana (não a média) do crescimento dos últimos cinco a dez anos. Se não conseguir justificar em uma frase, use zero.' },
      { q: 'O método projetivo é mais confiável que o Bazin?', a: 'Não necessariamente. Ele é mais preciso quando a premissa está certa e mais errado quando está errada, porque a projeção entra dividida por um número pequeno e o erro é amplificado. Use estimativa conservadora e trate o resultado como cenário, não como fato.' },
    ],
  },
}

export const PRECO_TETO_METODO_SLUGS = Object.keys(PRECO_TETO_METODOS)

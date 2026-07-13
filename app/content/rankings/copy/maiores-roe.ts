import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst: '',
  educationalSections: [
    {
      h2: 'O que é ROE (Return on Equity)?',
      paragraphs: [
        'ROE é o retorno sobre o patrimônio líquido, calculado dividindo o lucro líquido pelo patrimônio líquido. Mostra quanto a empresa gera de lucro pra cada real que os acionistas colocaram (capital próprio + lucros retidos). Um ROE de 20 por cento significa que pra cada R$ 100 de patrimônio, a empresa gerou R$ 20 de lucro no ano.',
        'É o indicador favorito de Warren Buffett pra identificar negócios de alta qualidade. Empresas com ROE consistente acima de 15 por cento por muitos anos seguidos costumam ter vantagem competitiva durável (marca forte, custo baixo, switching cost alto, efeito de rede).',
      ],
    },
    {
      h2: 'Como interpretar o ranking',
      paragraphs: [
        'ROE entre 10-15 por cento: aceitável, próximo da média de mercado. ROE entre 15-25 por cento: muito bom, sinal de qualidade operacional. ROE acima de 25 por cento: excepcional, geralmente vem com vantagem competitiva clara ou alavancagem alta (cuidado).',
        'Pra avaliar bem, sempre cruze ROE com endividamento. Empresa pode forçar ROE alto via alta alavancagem (mais dívida = menos patrimônio = ROE maior na conta). Bancos costumam ter ROE de 15-20 por cento com alavancagem natural do negócio. Industriais com ROE de 25 por cento sem dívida são a verdadeira excelência.',
      ],
    },
    {
      h2: 'Limitações',
      paragraphs: [
        'Decomposição DuPont: ROE = margem líquida × giro de ativos × alavancagem. Empresa pode atingir o mesmo ROE de 20 por cento por caminhos muito diferentes (margem alta vs giro alto vs muita dívida). Sempre vale a pena olhar a decomposição pra entender de onde vem o retorno.',
        'ROE pontual pode ser enganoso. Lucro extraordinário em um trimestre infla ROE temporariamente. Sempre pegue média de 3-5 anos pra ter visão real da capacidade da empresa de gerar valor sobre o patrimônio.',
      ],
    },
  ],
  crossLinks: [
    { title: 'Calculadora de Preço Teto', desc: 'Calcule o preço justo de uma ação por Graham e Bazin.', href: '/calculadora/preco-teto' },
    { title: 'Simulador de Ações', desc: 'Projete retorno total de uma carteira ao longo do tempo.', href: '/calculadora/acoes' },
    { title: 'Calculadora de Dividend Yield', desc: 'Simule o DY real de qualquer ação ou FII.', href: '/calculadora/dividend-yield' },
    { title: 'Outros rankings', desc: 'Veja todos os rankings disponíveis na Redentia.', href: '/rankings' },
  ],
  faqItems: [
    {
      q: 'Qual ROE é considerado bom?',
      a: 'Acima de 15 por cento é considerado bom no Brasil. Acima de 20 por cento é muito bom e sinaliza qualidade do negócio. Acima de 25 por cento é excepcional e merece análise extra (pode ser vantagem competitiva real ou alavancagem disfarçando o número).',
    },
    {
      q: 'ROE vs ROIC, qual a diferença?',
      a: 'ROE mede retorno sobre o capital dos acionistas (patrimônio). ROIC mede retorno sobre todo o capital investido (próprio + dívida). ROIC é mais "puro" porque elimina o efeito da estrutura de capital. Empresa com ROE alto mas ROIC baixo está usando alavancagem pra inflar o número.',
    },
    {
      q: 'Por que bancos têm ROE alto naturalmente?',
      a: 'Bancos têm modelo de negócio inerentemente alavancado (depósitos viram empréstimos), então o multiplicador de patrimônio é alto. Isso amplifica o ROE comparado a empresas industriais. Por isso comparar ROE de banco com ROE de uma siderúrgica não faz sentido, sempre dentro do mesmo setor.',
    },
    {
      q: 'ROE pode ser negativo?',
      a: 'Sim, quando a empresa tem prejuízo no ano. ROE negativo significa que a empresa destruiu valor do capital dos acionistas no período. Empresas em recuperação podem ter alguns anos de ROE negativo seguidos de retorno positivo, ciclo comum em turnarounds.',
    },
  ],
}

export default copy

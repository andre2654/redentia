import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst:
    'Margem líquida é o percentual da receita que vira lucro depois de impostos, despesas e custos: margem líquida = (lucro líquido ÷ receita) × 100. Empresas com margem acima de 20% tendem a ter modelos eficientes, poder de precificação e vantagem competitiva (bancos, transmissoras de energia, B3). Margem entre 5% e 15% é o padrão da maioria dos setores; abaixo de 5% indica baixa eficiência. Este ranking lista as 50 ações com maior margem líquida da B3 nos últimos 12 meses.',
  educationalSections: [
    {
      h2: 'O que é Margem Líquida?',
      paragraphs: [
        'Margem líquida é o percentual da receita total da empresa que sobra como lucro líquido depois de todos os custos, despesas e impostos. A fórmula é simples: lucro líquido dividido pela receita total, multiplicado por 100. Uma margem de 20 por cento significa que pra cada R$ 100 vendidos, a empresa fica com R$ 20 de lucro.',
        'É um dos indicadores mais importantes pra avaliar a saúde operacional de uma empresa. Margem alta indica poder de precificação, eficiência operacional ou modelo de negócio com baixos custos variáveis (software, financeiro, royalties). Margem baixa pode indicar setor competitivo, custos altos ou estrutura ineficiente.',
      ],
    },
    {
      h2: 'Como interpretar o ranking',
      paragraphs: [
        'Setores com margem líquida tipicamente alta: bancos (20-30 por cento), seguradoras (15-25 por cento), bolsas (B3 com 50+ por cento), tecnologia, royalties e algumas utilities reguladas. Setores com margem líquida baixa: varejo (3-7 por cento), construção (5-10 por cento), commodities (variável conforme ciclo).',
        'Comparação justa só faz sentido dentro do mesmo setor. Pegar uma varejista com margem de 6 por cento e comparar com um banco com margem de 25 por cento não diz nada sobre qualidade. Use o ranking como triagem inicial e depois compare empresas do mesmo setor entre si.',
      ],
    },
    {
      h2: 'Limitações',
      paragraphs: [
        'Margem líquida é influenciada por itens não recorrentes: ganhos extraordinários (venda de ativos), perdas pontuais (provisões, ações judiciais) ou benefícios fiscais. Sempre olhe pelo menos 3 anos pra ver se a margem é estrutural ou eventual.',
        'Margem alta sozinha não basta. Empresa com margem de 30 por cento mas crescimento zero pode ser pior que empresa com margem de 8 por cento e CAGR de 15 por cento. Cruze com crescimento de receita, ROE e geração de caixa antes de tirar conclusões.',
      ],
    },
  ],
  crossLinks: [
    {
      title: 'Calculadora de Preço Teto',
      desc: 'Calcule o preço justo de uma ação por Graham e Bazin.',
      href: '/calculadora/preco-teto',
    },
    {
      title: 'Simulador de Ações',
      desc: 'Projete retorno total de uma carteira ao longo do tempo.',
      href: '/calculadora/acoes',
    },
    {
      title: 'Calculadora de Dividend Yield',
      desc: 'Simule o DY real de qualquer ação ou FII.',
      href: '/calculadora/dividend-yield',
    },
    {
      title: 'Outros rankings',
      desc: 'Veja todos os rankings disponíveis na Redentia.',
      href: '/rankings',
    },
  ],
  faqItems: [
    {
      q: 'Qual é uma boa margem líquida no Brasil?',
      a: 'Depende do setor. Em geral, acima de 10 por cento já é considerado bom. Bancos e seguradoras costumam ficar entre 20-30 por cento. Empresas de software e royalties podem passar de 30 por cento. Varejo e construção operam com margem entre 3-10 por cento e ainda assim podem ser excelentes investimentos.',
    },
    {
      q: 'Margem líquida ou margem EBITDA, qual é mais importante?',
      a: 'Servem pra coisas diferentes. Margem EBITDA mostra eficiência puramente operacional (sem juros, impostos, depreciação). Margem líquida mostra o que sobra de fato pra distribuir aos acionistas ou reinvestir. Investidores costumam olhar as duas em conjunto: EBITDA pra entender o negócio, líquida pra entender o que rende.',
    },
    {
      q: 'Como margem líquida se relaciona com ROE?',
      a: 'Margem líquida é uma das peças do ROE pela decomposição DuPont: ROE = margem líquida × giro de ativos × alavancagem. Empresa com margem alta E giro alto E alavancagem moderada vai ter ROE acima de 20 por cento. Sempre que ver ROE alto, vale checar de onde ele vem.',
    },
    {
      q: 'O que reduz a margem líquida ano a ano?',
      a: 'Vários fatores: aumento de custos de matéria prima, salários, energia (commodities afetadas), entrada de concorrentes (queda de preço), expansão acelerada (custos crescem antes da receita), provisões fiscais ou ações judiciais. Sempre leia o release trimestral pra entender o porquê.',
    },
  ],
}

export default copy
